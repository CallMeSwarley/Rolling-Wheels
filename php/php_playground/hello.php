<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <title>Eintritt</title>
  <style>
    .edit-button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .edit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>

<body>
  <a href="https://rolling-wheels.net/admin/pages.php" class="edit-button">✏️ Edit Content</a>
  <?php
  $xmlFile = __DIR__ . '/../../rolling-wheels.net/data/pages/eintritt.xml';
  echo "<p>$xmlFile</p>";
  if (!file_exists($xmlFile)) {
    echo "<p>Die Datei 'eintritt.xml' wurde nicht gefunden.</p>";
    exit;
  }

  // Load XML
  $xml = simplexml_load_file($xmlFile);

  // Extract CDATA content (string cast is required)
  $content = (string) $xml->content;

  // Decode HTML entities like &lt;h3&gt; → <h3>
  $content = html_entity_decode($content, ENT_QUOTES, 'UTF-8');

  echo $content;
  ?>
</body>

</html>