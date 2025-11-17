@echo off
echo ========================================
echo   Avvio Server Locale
echo ========================================
echo.
echo Aprendo il browser su http://localhost:8000
echo.
echo Premi CTRL+C per fermare il server
echo ========================================
echo.

timeout /t 2 >nul
start http://localhost:8000

powershell -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8000/'); $listener.Start(); Write-Host 'Server avviato su http://localhost:8000' -ForegroundColor Green; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; if ($localPath -eq '/') { $localPath = '/index.html' }; $filePath = Join-Path '%CD%' $localPath.TrimStart('/'); if (Test-Path $filePath) { $content = [System.IO.File]::ReadAllBytes($filePath); $extension = [System.IO.Path]::GetExtension($filePath); $contentType = 'text/html'; if ($extension -eq '.css') { $contentType = 'text/css' }; if ($extension -eq '.js') { $contentType = 'application/javascript' }; if ($extension -eq '.jpg' -or $extension -eq '.jpeg') { $contentType = 'image/jpeg' }; if ($extension -eq '.png') { $contentType = 'image/png' }; $response.ContentType = $contentType; $response.ContentLength64 = $content.Length; $response.StatusCode = 200; $response.OutputStream.Write($content, 0, $content.Length) } else { $response.StatusCode = 404; $buffer = [System.Text.Encoding]::UTF8.GetBytes('404 - File Not Found'); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length) }; $response.Close() }"

