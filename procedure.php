<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['cmd']) && $_GET['cmd'] === 'saveDrinks') {
    $user = $_POST['user'] ?? '';
    $milk = $_POST['milk'] ?? 0;
    $espresso = $_POST['espresso'] ?? 0;
    $coffee = $_POST['coffee'] ?? 0;
    $long = $_POST['long'] ?? 0;
    $doppio = $_POST['doppio'] ?? 0;

    $dataFile = 'drinksData.json';
    $data = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

    if (!isset($data[$user])) {
        $data[$user] = [
            'milk' => 0,
            'espresso' => 0,
            'coffee' => 0,
            'long' => 0,
            'doppio' => 0
        ];
    }

    $data[$user]['milk'] += (int)$milk;
    $data[$user]['espresso'] += (int)$espresso;
    $data[$user]['coffee'] += (int)$coffee;
    $data[$user]['long'] += (int)$long;
    $data[$user]['doppio'] += (int)$doppio;

    file_put_contents($dataFile, json_encode($data));

    echo json_encode(['status' => 'success', 'message' => 'Data byla úspěšně uložena!']);
    exit;
}

header('HTTP/1.1 400 Bad Request');
echo json_encode(['status' => 'error', 'message' => 'Neplatný požadavek']);
