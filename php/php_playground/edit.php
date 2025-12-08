<?php
$xmlFile = 'eintritt.xml';
$message = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['content'])) {
    $newHtmlContent = $_POST['content'];

    // Load the XML file
    $xml = simplexml_load_file($xmlFile);

    // Encode the HTML content back to XML entities
    $encodedContent = htmlspecialchars($newHtmlContent, ENT_QUOTES, 'UTF-8');

    // Update the content node
    $xml->content = $encodedContent;

    // Save the XML file
    if ($xml->asXML($xmlFile)) {
        $message = '<div style="background-color: #d4edda; color: #155724; padding: 10px; margin: 10px 0; border-radius: 5px;">✓ Content saved successfully!</div>';
    } else {
        $message = '<div style="background-color: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border-radius: 5px;">✗ Error saving file!</div>';
    }
}

// Read the XML file and extract content
$htmlContent = '';
$decodedContent = '';
if (file_exists($xmlFile)) {
    $xml = simplexml_load_file($xmlFile);
    $htmlContent = (string) $xml->content;
    // Decode HTML entities for editing
    $decodedContent = html_entity_decode($htmlContent, ENT_QUOTES, 'UTF-8');
} else {
    $message = '<div style="background-color: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border-radius: 5px;">✗ XML file not found!</div>';
}
?>

<!DOCTYPE html>
<html lang="de">
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.core.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.core.js"></script>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit eintritt.xml</title>
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.core.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.core.js"></script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .content {
            padding: 30px;
        }

        textarea {
            width: 100%;
            min-height: 500px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            resize: vertical;
            transition: border-color 0.3s;
        }

        textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .button-group {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }

        button {
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-submit {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            flex: 1;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-reset {
            background: #f0f0f0;
            color: #333;
            padding: 12px 20px;
        }

        .btn-reset:hover {
            background: #e0e0e0;
        }

        .info {
            background: #e7f3ff;
            color: #004085;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 4px solid #004085;
        }

        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }

        .stat-item {
            flex: 1;
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-top: 5px;
        }

        .preview-section {
            background: #f8f9fa;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
            border: 2px solid #e0e0e0;
        }

        .preview-section h3 {
            margin-bottom: 15px;
            color: #667eea;
        }

        .editor-section {
            margin-bottom: 20px;
        }

        .editor-section h3 {
            margin-bottom: 15px;
            color: #667eea;
        }

        .back-button {
            display: inline-block;
            padding: 10px 20px;
            background: #6c757d;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            transition: all 0.3s;
        }

        .back-button:hover {
            background: #5a6268;
            transform: translateY(-2px);
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🛹 XML Editor</h1>
            <p>Edit eintritt.xml for Rolling Wheels</p>
        </div>

        <div class="content">
            <?php echo $message; ?>

            <a href="hello.php" class="back-button">← Back to View</a>

            <div class="info" style="margin-top: 20px;">
                <strong>ℹ️ Info:</strong> Edit the HTML content below. The preview shows how it will look on the page.
            </div>
            <div class="preview-section">
                <h3>📄 Preview</h3>
                <div id="preview">
                    <?php echo $decodedContent; ?>
                </div>
            </div>

            <div class="editor-section">
                <h3>✏️ Edit Content</h3>
                <form method="POST" action="" id="editorForm">
                    <div id="editor" contenteditable="true"
                        style="width: 100%; min-height: 500px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 5px; background: white; overflow-y: auto;">
                        <?php echo $decodedContent; ?>
                    </div>
                    <input type="hidden" name="content" id="hiddenContent">

                    <div class="button-group">
                        <button type="submit" class="btn-submit">💾 Save Changes</button>
                        <button type="button" class="btn-reset" onclick="resetEditor()">↺ Reset</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        const quill = new Quill('#editor');
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const hiddenContent = document.getElementById('hiddenContent');
        const form = document.getElementById('editorForm');
        const quill = new Quill('#editor');

        // Store original content
        let originalContent = editor.innerHTML;

        // Update preview on editor change
        editor.addEventListener('input', function () {
            preview.innerHTML = this.innerHTML;
        });

        // Before form submission, copy editor content to hidden field
        form.addEventListener('submit', function (e) {
            hiddenContent.value = editor.innerHTML;
            originalContent = editor.innerHTML;
        });

        // Reset function
        function resetEditor() {
            if (confirm('Are you sure you want to reset all changes?')) {
                editor.innerHTML = originalContent;
                preview.innerHTML = originalContent;
            }
        }

        // Confirm before leaving if there are unsaved changes
        window.addEventListener('beforeunload', function (e) {
            if (editor.innerHTML !== originalContent) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    </script>
</body>

</html>