import { LightningElement } from 'lwc';
import getAnswer from '@salesforce/apex/ChatWithGPT.getAnswer';


export default class AskGPT extends LightningElement {
   data;

    handleResponse() {
      this.data = this.template.querySelector("lightning-textarea").value;
      getAnswer({text:this.data}).then(resp => {
        const data = JSON.parse(resp);
        console.log(data);
        console.log(data.choices[0].text.trim());
        this.template.querySelector(".response").value = data.choices[0].text.trim();
      }).catch(error => {
        console.log("error message", error);
      })
    }

    handleReset(){
      this.template.querySelector("lightning-textarea").value = '';
      this.template.querySelector('.response').value = '';
    }
    
}