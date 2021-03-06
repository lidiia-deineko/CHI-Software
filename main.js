class Configuration{
   static root = 'http://localhost:3000';
}

class LoansList{

    list = [];
    target = null;

    //elements of loans
    loansItem = document.querySelectorAll('.loans-item')
    loansTotalAmount = document.querySelector('.loans-total-amount')

    //elements of modalForm
    modalForm = document.querySelector('.modal-form')
    formTitle = document.querySelector('.form-title')
    formAvailableValue = document.querySelector('.form-available_value')
    formTermValue = document.querySelector('.form-term_value')
    formBtn = document.querySelector('.form-btn')
    formInput = document.querySelector('.form-input')
    formCloseImg = document.querySelector('.form-close-img')

    //elements of total amount
    availableAmount = document.querySelector('.total-amount_value');

    isValid = document.querySelector('.modal-valid')

    urrentId;

    template = ({title, amount, available, tranche, id, invested}) =>`
        <div class="loans-item">
            <div class="loans-item_title">${title}</div>
            <div class="loans-item_info"><span>Amount: </span><span>${amount}</span></div>
            <div class="loans-item_info"><span>Available: </span><span>${available}</span></div>
            <div class="loans-item_info"><span>Tranche: </span><span>${tranche}</span></div>
            <button class="loans-item_btn" data-id="${id}">invest</button>
            <span ${JSON.parse(invested) ? 'class="is-invested"' : 'hide class="hide"'}>Invested</span>
        </div>
    `

    constructor(target) {
        this.target = document.querySelector(target);
        this.target.addEventListener('click', this.openModalForm.bind(this));
        this.formCloseImg.addEventListener('click', this.closeModalForm.bind(this));
        this.formBtn.addEventListener('click', async (event) => {
            await this.onInvestClick(event)
        })
    
        this.formInput.addEventListener('input', this.checkInput.bind(this));
        
    }

    async init() {
        try {
            await this.getList();
        } catch (e) {
            console.error('SOMETHING WENT WRONG', e);
        }
    }

    render() {
        
            if (!this.target) {
                return;
            }
    
            const html = this.list.map(this.template).join('');
    
            this.target.innerHTML = html;
    
            var initialValue = 0;
          
            var availableAmount = this.list.reduce(
                (previousValue, currentValue) => previousValue + Number(currentValue.available.split(',').join('.')) ,
                initialValue
            );
    
            this.availableAmount.innerHTML = String(availableAmount.toFixed(3)).split('.').join(',')  
    }

    async getList() {
        const response = await fetch(Configuration.root + '/loans-list');
        
        this.list = await response.json();

        return this.list;
    }


    openModalForm(event){
        if (event.target.className !== 'loans-item_btn') {
            return
        }
        const id = event.target.dataset['id'];

        this.currentId = id;
         
        const foundLoanByID = this.getLoanByID(id);

        this.formTitle.innerHTML = foundLoanByID.title;

        this.formAvailableValue.innerHTML = foundLoanByID.available;

        this.formBtn.dataset.id = foundLoanByID.id;

        this.modalForm.classList.remove('hide');
    }

    closeModalForm(event){
        this.modalForm.classList.add('hide');

        this.formInput.value = '';

        this.isValid.classList.add('hide');
    }

    getLoanByID(id) {
        return this.list.find(({id: currentId}) => currentId === id);
    }


    async onInvestClick(event){
        event.preventDefault();

        let valueInvest =  Number(String(this.formInput.value).split(',').join('.'));

        const foundLoanByID = this.getLoanByID(this.currentId);

        const currentValue = Number(String(foundLoanByID.available).split(',').join('.'));

        let valueDiff = currentValue - valueInvest

        if(isNaN(valueInvest) || valueInvest == 0 || valueInvest === '' || valueDiff < 0){

            this.isValid.classList.remove('hide');

            return
        }
    
        const available = (Number(foundLoanByID.available.split(',').join('.')) - valueInvest).toFixed(3);

        const invested = true;

        await this.updateAvailableAmount(this.currentId, available, invested);
        
    }

    async updateAvailableAmount(id, available, invested){

        const response = await fetch(Configuration.root + `/loans-list/${Number(id)}`, {
            method: 'PUT',
            body: JSON.stringify({available, invested}),
            headers: {
                'Content-Type': 'application/json'
            }})

        return response.json();
    }

    checkInput(){
        if(isNaN(this.formInput.value)){
            this.formInput.value = ''
        }
    }
}


window.addEventListener('load', async () => {

    const loansList = new LoansList('.loans-items');

    await loansList.init();

    loansList.render();

})