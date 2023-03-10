trigger OpportunityTrigger on Opportunity (before insert, before update, after insert, after update) {
    
    if(trigger.isAfter) {
        List<Contract> newLease = new List<Contract>();
    for(Opportunity opp: trigger.new) {
        if(Opp.StageName == 'Approved' ) {
            
            if(opp.Veteran__c =='yes') {
            Contract con = new Contract();
            con.AccountId = opp.AccountId;
            con.OwnerId = opp.OwnerId;
            con.Status = 'Draft';
            con.StartDate = opp.Lease_Start_Date__c;
            con.ContractTerm = opp.Lease_Term_Months__c.intValue();
            con.Property__c = opp.Property__c;
            con.Monthly_Rent__c = opp.Rent_Amount__c;
            con.Veteran_Discount__c = 10;
            newLease.add(con);
            } else if ( opp.DOB__c.year() <= 1957) {
            Contract con = new Contract();
            con.AccountId = opp.AccountId;
            con.OwnerId = opp.OwnerId;
            con.Status = 'Draft';
            con.StartDate = opp.Lease_Start_Date__c;
            con.ContractTerm = opp.Lease_Term_Months__c.intValue();
            con.Property__c = opp.Property__c;
            con.Monthly_Rent__c = opp.Rent_Amount__c;
            con.Senior_Discount__c = 10;
            newLease.add(con);
            } else {
            Contract con = new Contract();
            con.AccountId = opp.AccountId;
            con.OwnerId = opp.OwnerId;
            con.Status = 'Draft';
            con.StartDate = opp.Lease_Start_Date__c;
            con.ContractTerm = opp.Lease_Term_Months__c.intValue();
            con.Property__c = opp.Property__c;
            con.Monthly_Rent__c = opp.Rent_Amount__c;
            newLease.add(con);
            }
        }
    }
    
    insert newLease;
  }
    
    
    if(trigger.isInsert && trigger.isBefore){
        Map<Id,Account> mapOppIdToAccount = new Map<Id,Account>();
     for(Opportunity opp :trigger.New){
        if(opp.AccountId == NULL){
        Account acct = new Account(
            Name = opp.Name,
            Phone = opp.Phone__c,
            Email__c = opp.email__c,
            Birthdate__c = opp.DOB__c,
            RecordTypeId = '012Dn000000gfNn',
            Credit_Score__c = opp.Credit_Score__c,
            social_security__c = opp.Social_Security__c,
            Monthly_Salary__c = opp.Monthly_Income__c
        );
        // Add the opp Id as key and  new account  as values in the map
        mapOppIdToAccount.put(opp.id,acct);
        }
         
     }
     // If the new Account List/Map is not empty then Insert accounts 
     if(!mapOppIdToAccount.IsEmpty()){
        Database.Insert(mapOppIdToAccount.Values()); 
     }
     // Execute the for loop on trigger.new again
    for(Opportunity opp :trigger.New){
        if(opp.AccountId == NULL){
        //Checking if the  New account is present or not
        if(!mapOppIdToAccount.IsEmpty() && mapOppIdToAccount.ContainsKey(opp.Id)){
        //Update the AccountId field on Opportunity record by fetching account Id from the Map that we inserted
        opp.AccountId = mapOppIdToAccount.get(opp.Id).Id;
        }
    } 
  }
 }  
}