import os

# ==========================================
# 1. ファイルの中身を定義
# ==========================================

# 【共通】秘伝のタレ (secret_manual.md)
manual_content = """# 社内システム開発・運用ナレッジ（社外秘）

## 1. トラブルシューティング: 顧客サーバーA (AWS)
- **事象**: HTTP 502 Bad Gateway が深夜に多発する。
- **真の原因**: 
    - ログにはメモリ不足と出るが、本当の原因はウイルス対策ソフト「DefenseOne」の競合。
    - 特定のTempファイルをロックしてしまい、IISがタイムアウトしている。
- **対処法（再起動厳禁）**:
    1. サーバー再起動は**絶対にしてはならない**（DBの整合性チェックが走り、朝まで復旧しなくなる）。
    2. まずタスクキルで `DefOneAgent.exe` を落とす。
    3. `C:\\App\\Unlocker.bat` を管理者権限で実行し、共有メモリを解放する。
    4. これで502は自然解消する。

## 2. レガシーコード解説: 生産管理システム(旧)
- **対象**: `OrderManager.dll` / `T_ORDER` テーブル
- **隠された仕様**: 
    - カラム `DEL_FLG` は削除フラグではない。実は「配送(Delivery)済みフラグ」。
    - **削除済みデータ**は、`MEMO` 欄に「DELETE」という文字列が入っているレコードを指す。
    - **警告**: `WHERE DEL_FLG = 1` で削除データを検索しようとすると、配送済みデータがヒットして請求ミスになる。絶対に触るな。
"""

# 【Aさん用】Pythonコード (main.py)
python_code = """import asyncio
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
    
    prompt_template = \"\"\"
    あなたは工場のベテラン管理アシスタントです。
    以下の【社内マニュアル】のみに基づいて回答してください。

    【社内マニュアル】
    (ここにマニュアル変数を書く)

    【ユーザーの質問】
    (ここにユーザー入力変数を書く)
    \"\"\"

    # 4. 関数化
    try:
        kernel.add_function(
            prompt=prompt_template,
            function_name="ChatWithKnowledge",
            plugin_name="FactoryPlugin",
        )
    except Exception as e:
        print(f"⚠️ 関数作成エラー: {e}")

    print("\\n🤖 工場AIアシスタントが起動しました。（終了するには 'exit' と入力）")
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
            print(f"\\rAI > {result}\\n")
            
        except Exception as e:
            print(f"\\n❌ エラーが発生しました: {e}")

if __name__ == "__main__":
    asyncio.run(main())
"""

# 【Aさん用】requirements.txt
requirements_txt = """semantic-kernel>=1.0.0"""

# 【Bさん用】VB.NETコード (Program.vb)
vb_code = """Imports Microsoft.SemanticKernel
Imports Microsoft.SemanticKernel.Connectors.OpenAI
Imports System.IO

Module Program
    Sub Main(args As String())
        MainAsync(args).GetAwaiter().GetResult()
    End Sub

    Async Function MainAsync(args As String()) As Task
        ' ==========================================
        ' 【ハンズオン1】設定エリア
        ' ==========================================
        ' TODO: LM Studioのローカルサーバー情報を設定 (例: http://localhost:1234/v1)
        Dim endpoint As String = "" 
        Dim modelId As String = "llama-3.1-8b-instruct"
        
        ' 1. カーネルの作成
        Dim builder = Kernel.CreateBuilder()

        ' TODO: ここで OpenAI ではなく「ローカルLLM」につなぐ設定を書く
        ' ヒント: .AddOpenAIChatCompletion(modelId, apiKey, endpoint) を使う
        If Not String.IsNullOrEmpty(endpoint) Then
             builder.AddOpenAIChatCompletion(
                modelId:=modelId,
                apiKey:="not-needed",
                endpoint:=New Uri(endpoint)
            )
        End If
        
        Dim kernel = builder.Build()

        ' 2. マニュアル読み込み
        Dim manualPath As String = "../common/secret_manual.md"
        Dim manualContent As String = ""
        If File.Exists(manualPath) Then
            manualContent = File.ReadAllText(manualPath)
            Console.WriteLine($"✅ マニュアルを読み込みました: {manualPath}")
        Else
            Console.WriteLine("❌ マニュアルが見つかりません。")
            Return
        End If

        ' ==========================================
        ' 【ハンズオン3】プロンプトを作成する
        ' ==========================================
        ' TODO: {{$manual}} と {{$input}} を埋め込む
        Dim promptTemplate As String = "
        あなたは工場のベテラン管理アシスタントです。
        以下の【社内マニュアル】のみに基づいて回答してください。

        【社内マニュアル】
        (ここにマニュアル変数を書く)

        【ユーザーの質問】
        (ここにユーザー入力変数を書く)
        "

        ' 3. 関数化
        Dim chatFunction = kernel.CreateFunctionFromPrompt(promptTemplate)

        Console.WriteLine(vbCrLf & "🤖 工場AIアシスタントが起動しました。（終了するには 'exit' と入力）")
        Console.WriteLine(New String("-"c, 50))

        ' 4. 実行ループ
        While True
            Console.Write("あなた > ")
            Dim userInput = Console.ReadLine()
            If String.IsNullOrWhiteSpace(userInput) OrElse userInput.ToLower() = "exit" Then Exit While

            Console.Write("AI > 考え中...")

            Try
                Dim arguments = New KernelArguments()
                arguments("manual") = manualContent
                arguments("input") = userInput

                Dim result = Await kernel.InvokeAsync(chatFunction, arguments)
                Console.WriteLine(vbCr & "AI > " & result.ToString() & vbCrLf)

            Catch ex As Exception
                Console.WriteLine(vbCrLf & "❌ エラーが発生しました: " & ex.Message)
            End Try
        End While
    End Function
End Module
"""

# ==========================================
# 2. フォルダとファイルを作成
# ==========================================

base_dir = "Handson_Materials"
dirs = {
    "common": [("secret_manual.md", manual_content)],
    "A_Python": [("main.py", python_code), ("requirements.txt", requirements_txt)],
    "B_VBNET": [("Program.vb", vb_code)]
}

print(f"📂 '{base_dir}' フォルダを作成中...")

if not os.path.exists(base_dir):
    os.makedirs(base_dir)

for sub_dir, files in dirs.items():
    # フォルダ作成
    dir_path = os.path.join(base_dir, sub_dir)
    os.makedirs(dir_path, exist_ok=True)
    
    # ファイル書き込み
    for filename, content in files:
        file_path = os.path.join(dir_path, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  - 作成: {file_path}")

print("\n✨ 配布用資料の作成が完了しました！")
print(f"👉 '{base_dir}' フォルダを生徒に共有してください。")