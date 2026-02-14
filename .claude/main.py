import asyncio
import os
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.functions import KernelArguments

# ==========================================
# 設定エリア：講師用 (Mac + Ollama)
# ==========================================
ENDPOINT = "http://localhost:11434/v1"  # Ollamaのポート
MODEL_ID = "llama3.1"                   # ダウンロードしたモデル名
# ==========================================

async def main():
    # 1. カーネル（AIの司令塔）の初期化
    kernel = Kernel()

    # 2. AIサービス（脳みそ）の登録
    # ローカルLLMを「OpenAI」のフリをして登録します
    service = OpenAIChatCompletion(
        ai_model_id=MODEL_ID,
        api_key="ollama",          # 何でもOKですが空だとエラーになることがあります
        service_id="local-llm",
        base_url=ENDPOINT,         # ここでローカルサーバーに接続！
    )
    kernel.add_service(service)

    # 3. 社外秘マニュアルの読み込み
    manual_path = "secret_manual.md"
    if os.path.exists(manual_path):
        with open(manual_path, "r", encoding="utf-8") as f:
            manual_content = f.read()
            print(f"✅ マニュアルを読み込みました: {manual_path}")
    else:
        print("❌ マニュアルが見つかりません。同じフォルダに置いてください。")
        return

    # 4. プロンプト（指示書）の作成
    # ここにマニュアルの中身を埋め込みます
    prompt_template = """
    あなたは工場のベテラン管理アシスタントです。
    以下の【社内マニュアル】のみに基づいて、ユーザーの質問に答えてください。
    マニュアルに書いていないことは「わかりません」と答えてください。

    【社内マニュアル】
    {{$manual}}

    【ユーザーの質問】
    {{$input}}
    """

    # 5. 関数を作成
    chat_function = kernel.add_function_from_prompt(
        function_name="ChatWithManual",
        plugin_name="FactoryPlugin",
        prompt=prompt_template,
    )

    # 6. 実行ループ（対話開始）
    print("\n🤖 工場AIアシスタントが起動しました。（終了するには 'exit' と入力）")
    print("-" * 50)

    while True:
        user_input = input("あなた > ")
        if user_input.lower() in ["exit", "quit"]:
            break

        # マニュアルと質問を渡して実行
        # ここで「思考中...」と出すことで、重い処理でもユーザーを安心させます
        print("AI > 考え中...", end="", flush=True)
        
        try:
            arguments = KernelArguments(manual=manual_content, input=user_input)
            result = await kernel.invoke(
                function_name="ChatWithManual",
                plugin_name="FactoryPlugin",
                arguments=arguments
            )
            # 行頭に戻って上書き表示
            print(f"\rAI > {result}\n")
            
        except Exception as e:
            print(f"\n❌ エラーが発生しました: {e}")
            print("Ollamaが起動しているか確認してください（ollama run llama3.1）")

if __name__ == "__main__":
    asyncio.run(main())