public class AccRatingDelete {
    public static void AccRatingDeleted(List<AccRating__c> ratTrigger) {
        for (AccRating__c rat : ratTrigger) {
            Id ratAccId = rat.Account__c;
            Id ratUserId = rat.User__c;
            List<AccRating__c> ratListAfter = [SELECT Id, Account__c, User__c, Score__c, Review__c FROM AccRating__c WHERE Account__c =: ratAccId AND Id !=: rat.Id];
            
            Account acc = [SELECT Id, Score__c, Rating_Count__c FROM Account WHERE Id =: ratAccId];
            User usr = [SELECT Id FROM User WHERE Id =: ratUserId];
            
            Decimal ratiTotal = 0.0;
            Decimal ratiAmount = 0.0;
            Integer countRating = 0;
            
            // Calculate New Account Rating
            if (ratListAfter.size() > 0) {
                for (AccRating__c rati : ratListAfter) {
                    if (acc.Id == rati.Account__c) {
                        if (rati.Score__c != null) {
                            countRating++;
                            ratiTotal += Integer.valueOf(rati.Score__c);
                            ratiAmount += 1.0;
                        }
                    }
                }
            }
            
            // Update Score
            if (ratListAfter.size() == 0) {
                acc.Score__c = 0.0;
                acc.Rating_Count__c = 0;
            } else {
                Decimal ratiOverall = (ratiTotal / ratiAmount).setScale(1);
                // System.debug(ratiTotal + ' / ' + ratiAmount + ' = ' + ratiOverall);
                acc.Score__c = ratiOverall.setScale(1);
                acc.Rating_Count__c = countRating;
            }
            // System.debug(acc.Score__c);
            
            update acc;
        }
    }
}