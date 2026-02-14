import asyncio
import os
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.functions import KernelArguments

# ==========================================
# 設定エリア：講師用 (Mac + Ollama)
# ==========================================
ENDPOINT = "http://localhost:11434/v1"
MODEL_ID = "llama3.1"
# ==========================================

async def main():
    # 1. カーネルの初期化
    kernel = Kernel()

    # 2. AIサービスの登録
    service = OpenAIChatCompletion(
        ai_model_id=MODEL_ID,
        api_key="ollama",
        service_id="local-llm",
    )
    # 接続先URLを強制的に上書き（SK v1.x + Ollama接続の鉄板テクニック）
    service.client.base_url = ENDPOINT
    
    kernel.add_service(service)

    # 3. マニュアル読み込み
    manual_path = "secret_manual.md"
    if os.path.exists(manual_path):
        with open(manual_path, "r", encoding="utf-8") as f:
            manual_content = f.read()
            print(f"✅ 社外秘ナレッジを読み込みました: {manual_path}")
    else:
        print("❌ マニュアルが見つかりません。")
        return

    # 4. プロンプト作成
    prompt_template = """
    あなたは、このシステム開発会社の伝説的なベテランエンジニアです。
    新人からの質問に対し、以下の【社外秘ナレッジ】のみに基づいて回答してください。
    
    もしナレッジにない質問が来たら、「その件は資料がないから、ソースコードを読むしかないな（わかりません）」と答えてください。
    回答は、エンジニアらしく簡潔かつ具体的な手順で答えてください。

    【社外秘ナレッジ】
    {{$manual}}

    【新人からの質問】
    {{$input}}
    """

    # 5. 関数化（【修正点】ここが v1.x 対応の書き方です！）
    # add_function_from_prompt ではなく add_function を使います
    chat_function = kernel.add_function(
        prompt=prompt_template,
        function_name="ChatWithKnowledge",
        plugin_name="EngineeringPlugin",
    )

    print("\n💻 社内専用 技術伝承AIが起動しました。（終了: exit）")
    print("-" * 60)

    # 6. 実行ループ
    while True:
        user_input = input("あなた > ")
        if user_input.lower() in ["exit", "quit"]:
            break

        print("AI > 検索中...", end="", flush=True)
        
        try:
            arguments = KernelArguments(manual=manual_content, input=user_input)
            result = await kernel.invoke(
                function_name="ChatWithKnowledge",
                plugin_name="EngineeringPlugin",
                arguments=arguments
            )
            print(f"\rAI > {result}\n")
            
        except Exception as e:
            print(f"\n❌ エラー: {e}")

if __name__ == "__main__":
    asyncio.run(main())