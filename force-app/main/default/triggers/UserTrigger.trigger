trigger UserTrigger on User (before update) {
    for (User usr : Trigger.new) {
     	// Before Update: When user address information changed, update address of associated account & contact
     	// (Done since account and contact addresses can be automatically geocoded by Salesforce)
        UserUpdateAddress.UserAddressUpdate(Trigger.new, Trigger.oldMap);
    }
}