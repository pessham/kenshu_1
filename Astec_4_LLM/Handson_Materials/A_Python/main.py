import asyncio
import os
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.functions import KernelArguments

# ==========================================
# 【ハンズオン1】設定エリア
# ==========================================
# TODO: LM StudioのローカルサーバーのURLを入れる (例: http://localhost:1234/v1)
ENDPOINT = ""  
MODEL_ID = "llama-3.1-8b-instruct" # LM Studioでロードしたモデル名
# ==========================================

async def main():
    # 1. カーネルの初期化
    kernel = Kernel()

    # 2. AIサービスの登録
    service = OpenAIChatCompletion(
        ai_model_id=MODEL_ID,
        api_key="not-needed", # ローカルなので何でもOK
        service_id="local-llm",
    )
    
    # ★重要：ここで接続先を強制的に書き換える
    if ENDPOINT:
        service.client.base_url = ENDPOINT
    
    kernel.add_service(service)

    # 3. マニュアル読み込み
    manual_path = "../common/secret_manual.md" # 共通フォルダを見に行く
    manual_content = ""
    if os.path.exists(manual_path):
        with open(manual_path, "r", encoding="utf-8") as f:
            manual_content = f.read()
            print(f"✅ マニュアルを読み込みました: {manual_path}")
    else:
        print("❌ マニュアルが見つかりません。")
        return

    # ==========================================
    # 【ハンズオン3】プロンプトを作成する
    # ==========================================
    # TODO: 以下の変数をプロンプト内に埋め込む
    # マニュアルの中身: {{$manual}}
    # ユーザーの質問: {{$input}}
    
    prompt_template = """
    あなたは工場のベテラン管理アシスタントです。
    以下の【社内マニュアル】のみに基づいて回答してください。

    【社内マニュアル】
    (ここにマニュアル変数を書く)

    【ユーザーの質問】
    (ここにユーザー入力変数を書く)
    """

    # 4. 関数化
    try:
        kernel.add_function(
            prompt=prompt_template,
            function_name="ChatWithKnowledge",
            plugin_name="FactoryPlugin",
        )
    except Exception as e:
        print(f"⚠️ 関数作成エラー: {e}")

    print("\n🤖 工場AIアシスタントが起動しました。（終了するには 'exit' と入力）")
    print("-" * 50)

    # 5. 実行ループ
    while True:
        user_input = input("あなた > ")
        if user_input.lower() in ["exit", "quit"]:
            break

        print("AI > 考え中...", end="", flush=True)
        
        try:
            arguments = KernelArguments(manual=manual_content, input=user_input)
            result = await kernel.invoke(
                function_name="ChatWithKnowledge",
                plugin_name="FactoryPlugin",
                arguments=arguments
            )
            print(f"\rAI > {result}\n")
            
        except Exception as e:
            print(f"\n❌ エラーが発生しました: {e}")

if __name__ == "__main__":
    asyncio.run(main())
