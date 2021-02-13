const Modal = {
    changeModal(){
        document.querySelector('.modal-overlay').classList.toggle('active')
    },

    cancel(){
        Modal.changeModal()
        Form.clearFields()
    },
}

//guardar as informções no localStorage, é como se fosse um "banco de dados" mas no navegador.
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    //somar as entradas
    incomes(){
        let income = 0
        //pegar todas as transações
        //para cada uma
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })
        return income
    },

    //somar as saídas
    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        })
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    },

    sortDescription(){
        const value = document.querySelector('.description')
        
        this.all.sort((a,b) => {
            let x = a.description.normalize("NFD").toUpperCase()//tirar acentos e colocar tudomaiusculo para comparar corretamente
            let y = b.description.normalize("NFD").toUpperCase()
            if(x < y)
                return -1
            else if(x > y)
                return 1
            return 0
        })
            
        if(!value.classList.contains('crescente'))
            value.classList.add('crescente')
        else{
            this.all.reverse()
            value.classList.remove('crescente')
        }
        App.reload()
    },

    sortAmount(){
        const value = document.querySelector('.amount')
        
        this.all.sort((a,b) => {
            let x = a.amount
            let y = b.amount
            if(x < y)
                return -1
            else if(x > y)
                return 1
            return 0
        })
            
        if(!value.classList.contains('crescente'))
            value.classList.add('crescente')
        else
        {
            this.all.reverse()
            value.classList.remove('crescente')
        }   
        App.reload()
    },

    sortDate(){
        const value = document.querySelector('.date')
        
        this.all.sort((a,b) => {
            let dateSplittedA = a.date.split('/')
            let dateSplittedB = b.date.split('/')
            let x = dateSplittedA[2] + dateSplittedA[1] + dateSplittedA[0]
            let y = dateSplittedB[2] + dateSplittedB[1] + dateSplittedB[0]
            if(x < y)
                return -1
            else if(x > y)
                return 1
            return 0
        })
        if(!value.classList.contains('crescente'))
            value.classList.add('crescente')
        else
        {
            this.all.reverse()
            value.classList.remove('crescente')
        }
        App.reload()
    },
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = value * 100

        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")// esse/\D/g é uma expressão regular, os / / são o que definem a expressão regular, o \D é para achar tudo o que não for número, e o g é para ser global, pois se não tivesse o g ele só faria com o primeiro não número que achasse.

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })//isso é uma função que nesse caso formata o value para a forma de real BR.

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === ""){//trim faz uma limpeza dos espaços vazios da string
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try {
            //verificar se todas as informçaões foram preenchidas
            Form.validateFields()
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Form.saveTransaction(transaction)
            //apagar os dados do formulario
            Form.clearFields()
            //fechar modal
            Modal.changeModal()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()