trigger UserTrigger on User (before update) {
    // Before Update: When user address information changed, update address of associated account & contact
   	// (Done since account and contact addresses can be automatically geocoded by Salesforce)
   	Set<Id> userId = new Set<Id>();
    for (User usr : Trigger.new) {
        if(UserUpdateAddress.CheckUpdateAddress(Trigger.new, Trigger.oldMap))
        	userId.add(usr.Id);
    }
    if(!userId.isEmpty())
    	UserUpdateAddress.UserAddressUpdate(userId);
}