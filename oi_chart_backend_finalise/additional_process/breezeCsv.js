const fs = require('fs')
const { parse } = require('csv-parse')
const path = require('path')

let csvData = []
const readedObj = []

const getBreezeSymbols = async () => {
    return new Promise((resolve, reject) => {

        fs.createReadStream(path.join(__dirname, 'breeze-fno-stocks.csv'))
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", async (row) => {
                if (!readedObj.includes(row[2])) {
                    const symbolObj = {
                        symbol: row[2],
                        name: row[row.length - 1]
                    }
                    csvData.push(symbolObj)
                    readedObj.push(row[2])
                    // fs.appendFile(path.join(__dirname, 'writehere.txt'), "{ \n symbol: '" + row[2] + "', \n name: '" + row[row.length - 1] + "', \n fyersSymbol: '' \n }, \n", function (err) {
                    //     if (err) throw err;
                    //     console.log('Saved!');
                    // });
                }
            })
            .on('error', (err) => {
                console.log(err)
            })
            .on('end', async () => {
                const symbolSet = new Set(csvData)
                csvData = [...symbolSet]

                const moveToFront = (data, matchingId) => {
                    //find the index of the element in the array
                    const index = data.findIndex(({ symbol }) => symbol === matchingId);
                    if (index !== -1) {
                        //if the matching element is found, 
                        const updatedData = [...data];
                        //then remove that element and use `unshift`
                        updatedData.unshift(...updatedData.splice(index, 1));
                        return updatedData;
                    }
                    //if the matching element is not found, then return the same array
                    return data;
                }

                csvData = moveToFront(csvData, 'CNXBAN')
                csvData = moveToFront(csvData, 'NIFFIN')
                csvData = moveToFront(csvData, 'NIFTY')

                resolve(csvData)
            })
    })
}

module.exports = getBreezeSymbols