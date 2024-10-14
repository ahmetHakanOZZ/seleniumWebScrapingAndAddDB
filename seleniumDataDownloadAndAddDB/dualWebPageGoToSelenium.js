const mysql = require('mysql2');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myDatabase'
});

async function asyncFuntionParagraphsAdd() {
    let driver = await new Builder().forBrowser('chrome').build(); // or 'chrome'

    try {
        let url = 'https://www.freecodecamp.org/news/';
        await driver.get(url);

        let aTags = await driver.findElements(By.css('.post-card-image-link'));
        let a = 0;
        
        for (let aTag of aTags) {
            console.log(a += 1);
            remininFiles = aTags.length;
            let link = await aTag.getAttribute('href');

            console.log(link);

            const maxRetries = 3;
            let retries = 0;
            let success = false;

            while (!success && retries < maxRetries) {
                try {
                    
                    await driver.get(link);
                    success = true;
                } catch (error) {
                    retries++;
                    console.log(error);
                    console.log(`yeniden deneme ${retries}`);
                }
            }

            if (success) {
                let pText = await driver.wait(until.elementLocated(By.css('.post-content p')), 10000).getText();
                console.log(pText);
                db.query('SELECT * FROM paragraphs WHERE paragraphsName = ?', [pText],(err, result)=>{

                    if(err){
                        console.log('sorgu sırasında hata oluştu', err);
                        return
                    }
                    if(result.length > 0){
                        console.log(`bu veri ${pText} db'de zaten mevcut`);
                        remininFiles--;
                        if(remininFiles === 0){
                            db.end((err)=>{
                                if(err){
                                    console.log('db kapatılırıken hata olustu');
                                }
                                else{
                                    console.log('db kapatıldı');
                                }
                            });
                            
                        }
                    }
                    else{

                        db.query('INSERT INTO paragraphs (paragraphsName) VALUES (?)', [pText], (err, result) =>{
                            if(err){
                                console.log('kayıt yapılırken sorun oluştu',err);
                            }
                            else{
                                console.log(`veri ${pText} basarı ile kaydedildi`);
                            }
                            remininFiles--;
                            if(remininFiles === 0){
                                db.end((err)=>{
                                    if(err){
                                        console.log('db kapatılırken sorun oluştu',err);
                                    }
                                    else{
                                        console.log('db kapatıldı');
                                    }
                                })
                            }

                        } )

                    }

                })
                
            } else {
                console.log('sayfa yüklenemedi');
            }
        }
        await driver.sleep(2000);
    } catch (error) {
        console.error('Hata oluştu:', error);
    } finally {
        await driver.quit();
    }
}

asyncFuntionParagraphsAdd();
