public class emailWithAttachment {
     public static void sendEmail() {
        Contract[] results = [SELECT Id, StartDate, AccountId, (SELECT Id, Name FROM Attachments) FROM contract WHERE Id= '800Dn000000LSUPIA4'];
         
        


        for(Contract c:results) {
            for(attachment a:c.attachments) {
              System.debug(a);
            }
         }
        /*account = [SELECT Name, 
                  (SELECT Contact.Name, Contact.Email FROM Account.Contacts) 
                   FROM Account 
                   WHERE Id = :ApexPages.currentPage().getParameters().get('id')]; */
    }
    
    public class sendEmail {
    public String subject { get; set; }
    public String body { get; set; }

    private final Account account;

    // Create a constructor that populates the Account object
   

    public Account getAccount() {
        return account;
    }

    /*public PageReference send() {
        // Define the email
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage(); 

        // Reference the attachment page and pass in the account ID
        PageReference pdf =  Page.attachmentPDF;
        pdf.getParameters().put('id',(String)account.id); 
        pdf.setRedirect(true);

        // Take the PDF content
        Blob b = pdf.getContent();

        // Create the email attachment
        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName('attachment.pdf');
        efa.setBody(b);

        String addresses;
        if (account.Contacts[0].Email != null) {
            addresses = account.Contacts[0].Email;
            // Loop through the whole list of contacts and their emails
            for (Integer i = 1; i < account.Contacts.size(); i++) {
                if (account.Contacts[i].Email != null) {
                    addresses += ':' + account.Contacts[i].Email;
                }
            }
        }

        String[] toAddresses = addresses.split(':', 0);

        // Sets the paramaters of the email
        email.setSubject( subject );
        email.setToAddresses( toAddresses );
        email.setPlainTextBody( body );

        email.setFileAttachments(new Messaging.EmailFileAttachment[] {efa});

        // Sends the email
        Messaging.SendEmailResult [] r = 
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});   
		
        return null;
    }
*/
}

}