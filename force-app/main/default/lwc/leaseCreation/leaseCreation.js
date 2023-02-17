import { LightningElement, api, wire } from 'lwc';
import jsPDF from "@salesforce/resourceUrl/jsPDF";
import { loadScript } from 'lightning/platformResourceLoader';
import getLease from '@salesforce/apex/PdfGenerator.getLease';
import getProperty from '@salesforce/apex/PdfGenerator.getProperty';
import getName from '@salesforce/apex/PdfGenerator.getName';
import savePDF from '@salesforce/apex/PdfGenerator.savePDF';


export default class LeaseCreation extends LightningElement {

    @api recordId;
    date;
    propertyAddress;
    tenantName;
    startDate;
    endDate;
    Rent;
    isExecuting = false;
    dataPDF;


//   To prevent the quick action from being executed multiple times in parallel
   @api async LWCFunction() {
    if (this.isExecuting) {
        return;
    }
    //method executes every time the quick action is triggered.
     this.isExecuting = true;
     this.generatePDF();
     await this.sleep(3000);
     this.isExecuting = false;
   }

   sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    });
  }





   //Calling Apex getLease method to retrieve the lease object inf 
    @wire(getLease, {leaseId: '$recordId'})
    leaseFields({error, data}) {
        if(data) {
            console.log('From wire', data);
            this.startDate = data.StartDate;
            this.endDate = data.EndDate;
            this.Rent = data.Monthly_Rent__c;
            this.handleName(data.AccountId);
            this.handleProperty(data.Property__c);
        } else if(error) {
            console.log('error message: ', error);
        }
    }

    //Calling Apex getName to retrieve the name of the account on the lease
    handleName(id) {
        getName({accountId: id})
            .then(result => {
                console.log('handleName', result);
                this.tenantName = result.Name;
            })
            .catch(error => {
                console.log('error message: ', error);
            })
    }

    //Calling Apex getProperty to retrieve the address of the property on the lease
    handleProperty(id) {
        getProperty({propertyId: id})
            .then(result => {
                console.log('handleProperty', result);
                this.propertyAddress = `${result.Billing_Street__c}, ${result.Billing_City__c}, ${result.Billing_State__c} ${result.Billing_Postal_Code__c}`;
            })
            .catch(error => {
                console.log('error message: ', error);
            })

    }

    

  //Checks if the jsPDF library is loaded
    jsPdfInitialized=false;
    renderedCallback(){
        if (this.jsPdfInitialized) {
            return;
        }
        this.jsPdfInitialized = true;

        Promise.all([
            loadScript(this, jsPDF).then(() => {
                console.log("JS loaded");
            }).catch(error => {
                console.error("Error " + error);
            })
        ]);
    }


    generatePDF()
    {
        try
        {
            //Returns today's date
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); 
            let yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy; 
            this.date = today;



            const  { jsPDF }  = window.jspdf;
            let verticalOffset=0.5;
            let size = 12;
        
            //Paramter constructor for portrait pdf 
            const doc = jsPDF('p', 'in', 'letter');

            const header = 'RESIDENTIAL LEASE AGREEMENT';
            const stringText = `This Residential Lease Agreement (“Agreement”) made this ${this.date} is between: Atlantis Property Company ("Landlord") with a mailing address of 123 Main St, Atlanta, GA 30318 , AND ${this.tenantName} (“Tenant(s)”).\n\nLandlord and Tenant are each referred to herein as a “Party” and, collectively, as the "Parties."\n\nNOW, THEREFORE, FOR AND IN CONSIDERATION of the mutual promises and agreements contained herein, the Tenant agrees to lease the Premises from the Landlord under the following terms and conditions:\n\nProperty: The Landlord agrees to lease the described property below to the Tenant:            \nMailing Address: ${this.propertyAddress}\n\nThe aforementioned property shall be leased wholly by the Tenant (“Premises”). \n\nTerm: This Agreement shall be considered a:\n\nFixed Lease. The Tenant shall be allowed to occupy the Premises starting on ${this.startDate} and end on ${this.endDate} (“Lease Term”).\n\nAt the end of the Lease Term and no renewal is made, the Tenant: May continue to lease the Premises under the same terms of this Agreement under a month-to-month arrangement.\n\nRent: The Tenant shall pay the Landlord, in equal monthly installments, $${this.Rent}("Rent"). The Rent shall be due on the 1st of every month (“Due Date”).\n\nLate Fee: If Rent is not paid on the Due Date:\n\nThere shall be a penalty of $25 due as One (1) Time Payment. Rent is considered late when it has not been paid within 5 day(s) after the Due Date.\n\nTenant’s Signature ___________________________\n\nDate: _____________`;

            let h1 = doc.setFont('times', 'roman').setFontSize(18).splitTextToSize(header, 7.5);
            let p = doc.setFont('times', 'normal').setFontSize(16).splitTextToSize(stringText, 7.5);

            //In onder to calculate the height of the text in the canvas
           //I'm deviding the verticalOffset and size by 72 to convert inches into points
            doc.text(2.5, verticalOffset + size / 72, h1);
            verticalOffset += (h1.length + 3) * size / 72;
            doc.text(0.5, verticalOffset + size / 72, p);
            
            //Creates pdf document
            doc.save("Lease.pdf");
            
            //Convert the raw data from jsPDF to a base64 string value
            this.dataPDF = btoa(doc.output());
            
        }
        catch(error) {
            alert("Error " + error);
        }

        savePDF({pdf: this.dataPDF, name: this.tenantName, leaseId: this.recordId});
    }
}