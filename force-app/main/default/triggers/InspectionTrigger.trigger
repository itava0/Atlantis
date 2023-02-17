trigger InspectionTrigger on Inspection__c (before update) {
    for (Inspection__c ins : Trigger.new) {
        InspectionUpdate.InspectionUpdateEvent(Trigger.new, Trigger.oldMap);
    }
}