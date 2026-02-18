Imports Microsoft.SemanticKernel
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
        あなたはシステム開発会社のベテランエンジニアです。
        以下の【社内マニュアル】のみに基づいて回答してください。

        【社内マニュアル】
        {{$manual}}

        【ユーザーの質問】
        {{$input}}
        "

        ' 3. 関数化
        Dim chatFunction = kernel.CreateFunctionFromPrompt(promptTemplate)

        Console.WriteLine(vbCrLf & "🤖 熟練エンジニアAIが起動しました。（終了するには 'exit' と入力）")
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
