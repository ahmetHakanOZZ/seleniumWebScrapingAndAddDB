const mysql = require('mysql2');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myDatabase'

}); 
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


async function asyncFuntionParagraphsAdd(){

    
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        var url = 'https://www.ruyatabirleri.com/yorum/harf/m#google_vignette';
        await driver.get(url);
        
        const aTagss = await driver.findElements(By.css('.entery a:not(#sayfalama a)'));
        reminingFiles = aTagss.length;
        let list = [];
        for(aTag of aTagss) {
            let link = await aTag.getAttribute('href');
            list.push(link);
        }    
        for(let plink of list){
            console.log(plink);
            await driver.get(plink);
            let pTag = await driver.findElement(By.css('.entery p')).getText();
            console.log(pTag);
            await delay(5000); 
            db.query('SELECT * FROM paragraphs WHERE paragraphsName = ?', [pTag],(err, result)=>{
                if(err){
                    console.log('sorgu sırasında sorun olustu', err);
                }
                if(result.length > 0){

                    console.log(`bu veri ${pTag} db de zaten var`);
                    reminingFiles--;
                    if(reminingFiles === 0){
                        db.end((err)=>{
                            if(err){
                                console.log('db kapatılırken sorun olustu', err);
                            }
                            else{
                                console.log('db kapatıldı');
                            }
                        })
                    }

                }
                else{

                    db.query('INSERT INTO paragraphs (paragraphsName) VALUES (?)',[pTag],(err, result)=>{

                        if(err){
                            console.log('veri eklenirken sorun olustu', err);
                        }

                        else{
                            console.log(`veri(${pTag}) basarı ile eklendi`);
                        }
                        reminingFiles--;
                        if(reminingFiles === 0){
                            db.end((err)=>{
                                if(err){
                                    console.log('db kapatılırken sorun olustu', err);
                                }
                                else{
                                    console.log('db kapatıldı');
                                }
                            })
                        }

                    })

                }
            })
        } 
        

    } catch (error) {
        console.error('Hata oluştu:', error);
    } finally {
        await driver.close();
    }
}

asyncFuntionParagraphsAdd()

