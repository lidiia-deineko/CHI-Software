const root = 'http://localhost:3000';

class ModalForm{
    
}

class LoansList{
    list = [];
    root = null;

    availableAmount = document.querySelector('.total-amount_value');
    modalForm = document.querySelector('.modal-form')

    formTitle = document.querySelector('.form-title')
    formAvailableValue = document.querySelector('.form-available_value')
    formTermValue = document.querySelector('.form-term_value')
    formBtn = document.querySelector('.form-btn')
    formInput = document.querySelector('.form-input')
    formCloseImg = document.querySelector('.form-close-img')

    loansItem = document.querySelectorAll('.loans-item')

    isValid = document.querySelector('.modal-valid')

    loansTotalAmount = document.querySelector('.loans-total-amount')
    checkedTarget = ''
   
    templateOfLists = ({title, amount, available, tranche, id, invested}) =>`
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
        this.root = document.querySelector(target);
        this.root.addEventListener('click', this.openModalForm.bind(this)) 
    }

    async init() {
        try {
            await this.getList();
        } catch (e) {
            console.error('SOMETHING WENT WRONG', e);
        }
    }

    render() {
        
            if (!this.root) {
                return;
            }
    
            const html = this.list.map(this.templateOfLists).join('');
    
            this.root.innerHTML = html;
    
            var initialValue = 0;
          
            var availableAmount = this.list.reduce(
                (previousValue, currentValue) => previousValue + Number(currentValue.available.split(',').join('.')) ,
                initialValue
            );
    
            this.availableAmount.innerHTML = String(availableAmount.toFixed(3)).split('.').join(',')  
    }

    async getList() {
        const response = await fetch(root + '/loans-list');
        
        this.list = await response.json();

        return this.list;
    }


    openModalForm(event){
        if (event.target.className !== 'loans-item_btn') {
            return
        }
        const id = event.target.dataset['id'];

        this.currentId = id
         
        const foundLoanByID = this.getLoanByID(id)

        this.formTitle.innerHTML = foundLoanByID.title
        this.formAvailableValue.innerHTML = foundLoanByID.available
        this.formTermValue.innerHTML = foundLoanByID.term_remaining
        this.formBtn.dataset.id = foundLoanByID.id

        this.modalForm.classList.remove('hide')
    }

    closeModalForm(event){
        this.modalForm.classList.add('hide')
        this.formInput.value = ''
        this.isValid.classList.add('hide')
    }

    getLoanByID(id) {
        return this.list.find(({id: currentId}) => currentId === id);
    }


  

  
    checkForm(value){

    }

}

window.addEventListener('load', async (event) => {

    const loansList = new LoansList('.loans-items');
    await loansList.init()
    loansList.render();

    loansList.formBtn.addEventListener('click', async (event) => {
        
        await loansList.onInvestClick(event)
    })

    // loansList.formInput.addEventListener('input', (event) => {
    //     loansList.checkInput(event)
    // })


    loansList.formCloseImg.addEventListener('click', (event) => {
        loansList.closeModalForm(event)
    })


 
})