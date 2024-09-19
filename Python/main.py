import tkinter as tk
from tkinter import messagebox, simpledialog
from datetime import datetime

class CoffeeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Evidenční formulář kávy")
        self.root.configure(bg='white')  # Set background color to white

        # Create a dictionary to hold drink data per month
        self.drinks_data = {}

        # User selection
        tk.Label(root, text="Vyberte osobu", bg='white', font=('Arial', 16)).pack(pady=10)
        self.user_var = tk.StringVar()
        users = ["Masopust Lukáš", "Molič Jan", "Adamek Daniel", "Weber David"]
        for user in users:
            tk.Radiobutton(root, text=user, variable=self.user_var, value=user, bg='white', font=('Arial', 14)).pack(pady=5)

        # Create sliders for different drinks
        self.drink_vars = {
            "Mléko": tk.IntVar(),
            "Espresso": tk.IntVar(),
            "Coffe": tk.IntVar(),
            "Long": tk.IntVar(),
            "Doppio+": tk.IntVar()
        }
        for drink in self.drink_vars:
            tk.Label(root, text=drink, bg='white', font=('Arial', 14)).pack(pady=5)
            tk.Scale(root, from_=0, to=10, orient=tk.HORIZONTAL, variable=self.drink_vars[drink],
                     bg='#e6e6e6', troughcolor='#007BFF', sliderlength=30, length=400).pack(pady=5)

        # Submit button
        tk.Button(root, text="Odeslat", command=self.submit_data, bg='#007BFF', fg='white', font=('Arial', 14),
                  padx=10, pady=5).pack(pady=10)

        # Show results button
        tk.Button(root, text="Zobrazit výsledky", command=self.show_results, bg='#007BFF', fg='white', font=('Arial', 14),
                  padx=10, pady=5).pack(pady=10)

        # Show monthly summary button
        tk.Button(root, text="Zobrazit měsíční přehled", command=self.show_summary, bg='#007BFF', fg='white', font=('Arial', 14),
                  padx=10, pady=5).pack(pady=10)

    def submit_data(self):
        user = self.user_var.get()
        if not user:
            messagebox.showwarning("Chyba", "Vyberte osobu!")
            return

        # Get current month
        current_month = datetime.now().month

        if current_month not in self.drinks_data:
            self.drinks_data[current_month] = {}

        if user not in self.drinks_data[current_month]:
            self.drinks_data[current_month][user] = {drink: 0 for drink in self.drink_vars}

        for drink, var in self.drink_vars.items():
            self.drinks_data[current_month][user][drink] += var.get()

        # Save data to file
        self.save_data()
        messagebox.showinfo("Úspěch", "Data byla odeslána!")

    def save_data(self):
        with open("drinks_data.txt", "w") as file:
            for month, users_data in self.drinks_data.items():
                file.write(f"Měsíc: {month}\n")
                for user, drinks in users_data.items():
                    file.write(f"{user}\n")
                    for drink, amount in drinks.items():
                        file.write(f"{drink}: {amount}\n")
                    file.write("\n")

    def show_results(self):
        results = ""
        try:
            with open("drinks_data.txt", "r") as file:
                results = file.read()
        except FileNotFoundError:
            results = "Žádná data nebyla uložena."
        messagebox.showinfo("Výsledky", results)

    def show_summary(self):
        month = simpledialog.askinteger("Měsíc", "Zadejte měsíc (číslo od 1 do 12):")
        if month is None:
            return

        summary_data = self.load_summary_data_for_month(month)
        if not summary_data:
            messagebox.showinfo("Měsíční přehled", f"Pro měsíc {month} nejsou dostupná žádná data.")
            return

        summary = f"Data pro měsíc {month}:\n"
        for user, drinks in summary_data.items():
            summary += f"{user}:\n"
            for drink, amount in drinks.items():
                summary += f"  {drink}: {amount}\n"

        messagebox.showinfo("Měsíční přehled", summary)

    def load_summary_data_for_month(self, month):
        try:
            with open("drinks_data.txt", "r") as file:
                lines = file.readlines()

            monthly_data = {}
            current_month = None
            current_user = None

            for line in lines:
                line = line.strip()
                if line.startswith("Měsíc:"):
                    current_month = int(line.split(":")[1].strip())
                elif current_month == month:
                    if line in self.drinks_data.get(current_month, {}):  # User
                        current_user = line
                        monthly_data[current_user] = {}
                    elif ":" in line and current_user:  # Drink data
                        drink, amount = line.split(":")
                        monthly_data[current_user][drink.strip()] = int(amount.strip())
            return monthly_data

        except FileNotFoundError:
            return None


if __name__ == "__main__":
    root = tk.Tk()
    app = CoffeeApp(root)
    root.mainloop()
