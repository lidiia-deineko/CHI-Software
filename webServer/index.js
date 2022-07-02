const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { json } = require('body-parser');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

class LoansListActions{
    static readLoansList(){
        return new Promise((resolve, reject) => {
            fs.readFile('data/current-loans.json', 'utf8', (err, loansList) => {
                if (err) {
                  console.error(err);
                  reject(err)
                  return;
                }

                console.log(loansList);
                resolve(loansList);

              });
        })
    }

    static writeLoansList(content){
        fs.writeFile('data/current-loans.json', JSON.stringify(content, null, '\t'), err => {
            if (err) {
              console.error(err);
            }
          });
    }
}

async function loadLoansListRequest(){
    return await LoansListActions.readLoansList();
}


app.get('/loans-list/', (req, res) => {
   
    async function initLoadLoansListRequest(){
        
        const loansList = await loadLoansListRequest()

        parsedLoansList = JSON.parse(loansList)

        res.send(JSON.stringify(parsedLoansList.loans, null, '\t'))
    }

    initLoadLoansListRequest()

});


app.put('/loans-list/:id', (req, res) => {
    
    const {id} = req.params;

    const {available} = req.body;

    const {invested} = req.body;

    if (!id) {
        res.status(401).send('Id is required');

        return;
    }

    async function initLoadLoansListRequest(){
        const loansList = await loadLoansListRequest();

        const parsedLoansList =  JSON.parse(loansList);

        const loansData = parsedLoansList.loans;

        const foundLoan = loansData.find(({id: currentId}) => {

            return currentId === id;

        });

        if (!foundLoan) {

            res.status(401).send('Todo not found');
    
            return;
        }

        const changedAvailable = `${available}`.split('.').join(',')

        foundLoan.available = changedAvailable;

        foundLoan.invested = invested;

        LoansListActions.writeLoansList(parsedLoansList);

        res.send(true);

    }

    initLoadLoansListRequest();

});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})