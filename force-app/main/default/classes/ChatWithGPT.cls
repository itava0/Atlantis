public with sharing class ChatWithGPT {

  public class IssueOutput { 
     
    @InvocableVariable( required=true ) 
    public String response = ''; 
} 
 
  public class IssueInput { 
 
    @InvocableVariable( required=true ) 
    public String issueWithProperty; 
     
} 

@InvocableMethod(label='Report an issue') 
public static List < IssueOutput > fetchChatGPTResponse( List < IssueInput > listIssueInputs ) { 
  List<IssueOutput> issueOutputs = new List<IssueOutput>();
    // Get the issue on the propeperty from the input
    for (IssueInput issue : listIssueInputs) {
      IssueOutput issueOutput = new IssueOutput();
       // Instantiate a new Http object
  Http h = new Http();

  // Instantiate a new HTTP request
  // Specify request properties such as the endpoint, the POST method, etc. 
  HttpRequest req = new HttpRequest();
  req.setEndpoint('https://api.openai.com/v1/completions');
  req.setMethod('POST');
  req.setHeader('Content-Type', 'application/json;charset=UTF-8');
  req.setHeader('Authorization', 'Bearer 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');
  req.setBody('{"model":"text-davinci-003","prompt":"'+issue.issueWithProperty+'","max_tokens":100,"temperature":0}');
  // Send the request, and return a response
  HttpResponse res = h.send(req);

 // Parse JSON response to get all the totalPrice field values.
 JSONParser parser = JSON.createParser(res.getBody());
 String result;
 while (parser.nextToken() != null) {
     if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
         (parser.getText() == 'text')) {
         // Get the value.
         parser.nextToken();
         // Compute the grand total price for all invoices.
         result += parser.getText();
     }
 }


  issueOutput.response = result;

  issueOutputs.add(issueOutput);
  
    }

    return issueOutputs;
   
}

    
}