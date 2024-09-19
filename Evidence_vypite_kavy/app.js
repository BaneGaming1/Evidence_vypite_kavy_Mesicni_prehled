document.addEventListener('DOMContentLoaded', () => {
    window.updateTextInput = function(rangeInput, labelId) {
        const labelElement = document.getElementById(labelId);
        if (labelElement) {
            labelElement.innerText = rangeInput.value;
        } else {
            console.error(`Element s ID ${labelId} nebyl nalezen.`);
        }
    };

    function sendDataToServer(formData) {
        return fetch('/procedure.php?cmd=saveDrinks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP chyba! Status: ${response.status}`);
            }
            return response.json();
        });
    }

    function saveData(formData) {
        let drinksData = JSON.parse(localStorage.getItem('drinksData')) || {};

        const user = formData.user;
        if (!drinksData[user]) {
            drinksData[user] = {
                milk: 0,
                espresso: 0,
                coffee: 0,
                long: 0,
                doppio: 0
            };
        }

        drinksData[user].milk += parseInt(formData.milk, 10);
        drinksData[user].espresso += parseInt(formData.espresso, 10);
        drinksData[user].coffee += parseInt(formData.coffee, 10);
        drinksData[user].long += parseInt(formData.long, 10);
        drinksData[user].doppio += parseInt(formData.doppio, 10);

        localStorage.setItem('drinksData', JSON.stringify(drinksData));
    }

    document.getElementById('coffeeForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = {
            user: document.querySelector('input[name="user"]:checked')?.value,
            milk: document.querySelector('input[name="milk"]').value,
            espresso: document.querySelector('input[name="espresso"]').value,
            coffee: document.querySelector('input[name="coffee"]').value,
            long: document.querySelector('input[name="long"]').value,
            doppio: document.querySelector('input[name="doppio"]').value
        };

        if (!formData.user) {
            alert("Vyberte osobu!");
            return;
        }

        sendDataToServer(formData)
            .then(response => {
                alert(response.message);
                saveData(formData);
            })
            .catch(error => {
                console.error("Chyba při odesílání dat:", error);
                alert("Chyba při odesílání dat!");
            });
    });

    document.getElementById('showResults').addEventListener('click', () => {
        const drinksData = JSON.parse(localStorage.getItem('drinksData')) || {};
        const resultsDiv = document.getElementById('results');
        
        if (Object.keys(drinksData).length === 0) {
            resultsDiv.innerHTML = "<p>Žádná data nebyla uložena.</p>";
            return;
        }

        let html = "<h3>Seznam vypité kávy:</h3>";
        for (const user in drinksData) {
            const data = drinksData[user];
            html += `
                <p><strong>${user}:</strong></p>
                <ul>
                    <li>Mléko: ${data.milk}</li>
                    <li>Espresso: ${data.espresso}</li>
                    <li>Káva: ${data.coffee}</li>
                    <li>Long: ${data.long}</li>
                    <li>Doppio: ${data.doppio}</li>
                </ul>
            `;
        }
        resultsDiv.innerHTML = html;
    });

    function fetchMonthlySummary(month) {
        return fetch(`http://ajax1.lmsoft.cz/procedure.php?cmd=getSummaryOfDrinks&month=${month}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa('coffee:kafe') // Základní autentizace
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP chyba! Status: ${response.status}`);
            }
            return response.json();
        });
    }

    document.getElementById('showSummary').addEventListener('click', () => {
        const month = document.getElementById('month').value;

        if (!month || month < 1 || month > 12) {
            alert("Zadejte platné číslo měsíce od 1 do 12.");
            return;
        }

        fetchMonthlySummary(month)
            .then(data => {
                console.log('Data měsíčního přehledu:', data); // Zobrazí odpověď v konzoli
                const summaryDiv = document.getElementById('summary');
                if (Array.isArray(data) && data.length > 0) {
                    let summaryMap = {};
                    
                    // Zpracování dat do formátu {user: {type: amount}}
                    data.forEach(entry => {
                        const [type, amount, user] = entry;
                        if (!summaryMap[user]) {
                            summaryMap[user] = {};
                        }
                        summaryMap[user][type] = (summaryMap[user][type] || 0) + parseInt(amount, 10);
                    });

                    // Generování HTML pro zobrazení
                    let html = "<h3>Měsíční přehled:</h3>";
                    for (const user in summaryMap) {
                        let userSummary = summaryMap[user];
                        for (const type in userSummary) {
                            html += `
                                <p><strong>${user}:</strong> ${userSummary[type]} ${type}</p>
                            `;
                        }
                    }
                    summaryDiv.innerHTML = html;
                } else {
                    summaryDiv.innerHTML = "<p>Žádná data pro zadaný měsíc.</p>";
                }
            })
            .catch(error => {
                console.error("Chyba při načítání měsíčního přehledu:", error);
                alert("Chyba při načítání měsíčního přehledu!");
            });
    });
});
