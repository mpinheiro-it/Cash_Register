function checkCashRegister(price, cash, cid) {
  //The cash in drawer (cid) variable will be muted in the function
  //so I've stored the original cid provided separately in case it is needed
  const originalCid = JSON.parse(JSON.stringify(cid));

  //value references for each cash unit 
  let units = [
      {currency: "PENNY",   value: 0.01},
      {currency: "NICKEL",  value: 0.05},
      {currency: "DIME",    value: 0.10},
      {currency: "QUARTER", value: 0.25},
      {currency: "ONE",     value: 1},
      {currency: "FIVE",    value: 5},
      {currency: "TEN",     value: 10},
      {currency: "TWENTY",  value: 20},
      {currency: "ONE HUNDRED", value: 100},
    ]

  //two variables that will be returned
  let status = "";
  let change = [];

  //variables used for calculations in the sub functions below
  let availableCash = 0;
  let unavailableCurrencies = []
  let result = [];
  let dif = (cash - price);
  let highestDecimal = {}
  
 
  // Main Function  
  return verifyCashInDrawer(dif, availableCash)
  
  
  /*Checks if (1) cash is available on the drawer
  (2) no cash is available
  (3) no change is needed
  Calculates and returns the expected results for each scenario */
  function verifyCashInDrawer(dif, availableCash){
      
      //Checks: (1) if any currency is unavailable 
      //(2) the total amount of available cash in drawer      
      for (let i = 0; i < cid.length; i++){
        availableCash += cid[i][1]
        unavailableCurrencies.push(units.filter(unit => unit.currency == cid[i][0] && cid[i][1] == 0))
      }
      
      //filters the unavailable currencies names and remove them from units
      unavailableCurrencies = unavailableCurrencies.filter(x => x.length)
                                                   .map(x => x.pop())
                                                   .map(x => x.currency)
      
      units = units.filter(unit => !unavailableCurrencies.includes(unit.currency))

      //defines the expected results
      if (dif == 0){
        status = "CLOSED" 
        change = [] //no change is needed
      } else if (dif > availableCash){
        status = "INSUFFICIENT_FUNDS" //not enough cash in drawer available
        change = [] 
      } else {
        status=  "OPEN"        
        calculateChange() //calculates the change if needed 
      }   

      return generateFinalResult()  
}    
  

function calculateChange(){
  while (dif > 0){   
    
      highestDecimal = findHighestDecimal()// finds highest currency for the change
      
      if (highestDecimal !== "INSUFFICIENT_FUNDS"){

        subtractFromCid(highestDecimal) //subtracts the money taken from the drawer
        
        result.push(highestDecimal)//adds the money taken to the result array      

        dif = (dif - highestDecimal.value).toFixed(2)  

        } else { //handles the case of not having enough cash for the change
          dif = 0;
          status = "INSUFFICIENT_FUNDS"
          result = [] 
        }  
      }  
  }


function findHighestDecimal(){  
  //gets the highest currency that could be used from units
  let decimal = units.filter(unit => unit.value <= dif).pop()
  
  //handles the case of not having enough cash for the change
  if (typeof decimal == "undefined"){
    return "INSUFFICIENT_FUNDS" 
  } else {

  //after choosing one currency, checks how much of it is available on the drawer
    let correspondingCashInDrawer = cid.filter(x => x[0] == decimal.currency).pop()[1]
    let index = units.indexOf(decimal)    

  //if there is money available it returns it 
    if (correspondingCashInDrawer > 0){      
      return decimal
      } else { //if not, removes it from units 
        units.splice(index, 1);       
        return findHighestDecimal() //and use recursion to find another currency
      }
    }
  }

//subtracts cash taken from the drawer (cid)
function subtractFromCid(highestDecimal){
    for (let i = 0; i < cid.length; i++){
      if (cid[i][0] == highestDecimal.currency){
        cid[i][1] -= highestDecimal.value
        }
        
    }
  }


//function used to format the result in the desired output
  function fixResult(result){
      const counter = {};
      result.forEach(function(obj) {
      let key = JSON.stringify(obj) //object is converted to a string
      counter[key] = (counter[key] || 0) + 1 //ocurrences of each unit are counted
    })      

  //deletes duplicates from the change output
    for (let i = 0; i < result.length; i++){
      if (result[i] == result[i-1]){
      delete result[i-1]
      }
    }

  //removes blank values after deletion above
      result = result.filter(n => n) 

  /*iterates over each item on the result variable
  and multiplies it's value by the number of times 
  it has been counted*/
      for (let i = 0; i < result.length; i++){
        let stringResult = JSON.stringify(result[i])
        if (counter[stringResult]){
          result[i].value *= counter[stringResult]
        }
      }   
  	//removes all keys, leaving only the values on the result array
    result = result.map(x => Object.values(x))
    return result;
  }


function generateFinalResult() {
      //checks how much cash is left
      cid.map(x => availableCash += x[1])

      if (availableCash <= 0){ //if zero closes the cash register
            status = "CLOSED"   
            change = originalCid
            return {status, change} //and returns the original cid
        } else {
            change = fixResult(result) //fixes the result format   
            return {status, change};
        } 
  }
}

console.log(checkCashRegister(19.5, 20, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]));
