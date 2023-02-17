public class sendNotification {
    
    Public static void sendNotification() {
   // First, reserve email capacity for the current Apex transaction to ensure
// that we won't exceed our daily email limits when sending email after
// the current transaction is committed.
Messaging.reserveSingleEmailCapacity(2);

// Processes and actions involved in the Apex transaction occur next,
// which conclude with sending a single email.

// Now create a new single email message object
// that will send out a single email to the addresses in the To, CC & BCC list.
Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

//Query the email template created using classic email template 
EmailTemplate tp = [Select Id,Name,Subject,HtmlValue,Body from EmailTemplate where name= 'Lease_template' LIMIT 1];      

// Strings to hold the email addresses to which you are sending the email.
String[] toAddresses = new String[] {'itavare01@gmail.com'}; 

// Assign the addresses for the To and CC lists to the mail object.
mail.setToAddresses(toAddresses);

// Assign the Id for Template        
mail.setTemplateId(tp.Id);

// Specify the address used when the recipients reply to the email. 
mail.setReplyTo('atlantispropertiescompany@gmail.com');

// Specify the name used as the display name.
mail.setSenderDisplayName('Atlantis Property Management');

// Specify the subject line for your email address.
mail.setSubject(tp.Subject);

// Optionally append the Salesforce email signature to the email.
// The email address of the user executing the Apex Code will be used.
mail.setUseSignature(false);
        
        Map<String, String> params=new Map<String, String> {'{name}' => 'Ivan'};
        	if(params!=null && params.size()>0){
                String body=tp.HtmlValue;
            for(String key :params.keySet()){
                string val=params.get(key);
                body=body.replace(key,val);
                 mail.setHtmlBody(body);
                system.debug('body:'+body);
            }
                
        }
        
try {
    // Send the email you have created.
Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    return;
} catch (Exception e) {
    System.debug(e.getMessage());
}

 }
}