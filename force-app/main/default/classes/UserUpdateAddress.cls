public class UserUpdateAddress {
    public static void UserAddressUpdate(List<User> usrList, Map<Id, User> usrOldMap) {
        for (User usr : usrList) {
            // Get Contact and Account Information from User
            Id conId;
            Id accId;
            List<Contact> conList = new List<Contact>();
            
            // Only populate information if the lists have data (accounting for list exceptions in cases of no linked Account or Contact) 
            if (usrList.size() > 0) {
                conId = usrList[0].ContactId;
                conList = [SELECT AccountId FROM Contact WHERE Id =: conId];
                if (conList.size() > 0) {
                    accId = conList[0].AccountId;
                }
            }
            
            // Get Account and Contact from IDs
            Contact con;
            if (conId != null) con = [SELECT Id FROM Contact WHERE Id =: conId LIMIT 1];
            Account acc;
            if (accId != null) acc = [SELECT Id FROM Account WHERE Id =: accId LIMIT 1];
            
            // If any address field has been modified, update the corresponding account and contact fields
            if (usr.Street != usrOldMap.get(usr.Id).Street) {
                if (acc != null) acc.BillingStreet = usr.Street;
                if (con != null) con.MailingStreet = usr.Street;
            }
            if (usr.City != usrOldMap.get(usr.Id).City) {
                if (acc != null) acc.BillingCity = usr.City;
                if (con != null) con.MailingCity = usr.City;
            }
            if (usr.State != usrOldMap.get(usr.Id).State) {
                if (acc != null) acc.BillingState = usr.State;
                if (con != null) con.MailingState = usr.State;
            }
            if (usr.PostalCode != usrOldMap.get(usr.Id).PostalCode) {
                if (acc != null) acc.BillingPostalCode = usr.PostalCode;
                if (con != null) con.MailingPostalCode = usr.PostalCode;
            }
            if (usr.Country != usrOldMap.get(usr.Id).Country) {
                if (acc != null) acc.BillingCountry = usr.Country;
                if (con != null) con.MailingCountry = usr.Country;
            }
            
            // Update the account and contact
            if (acc != null) update acc;
            if (con != null) update con;
        }
    }
}