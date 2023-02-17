global class AddressCleanup implements Schedulable {
    global void execute(SchedulableContext sc) {
        Date dat = System.today().adddays(-7);
        List<Address__c> addList = [SELECT Id FROM Address__c WHERE CreatedDate <=: dat];
        if (!addList.isEmpty()) {
            delete addList;
        }
    }
}