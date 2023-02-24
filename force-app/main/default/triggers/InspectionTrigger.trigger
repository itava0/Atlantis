trigger InspectionTrigger on Inspection__c (before update) {
    // Before Update: If inspection updated, modify the associated event
    for (Inspection__c ins : Trigger.new) {
        InspectionUpdate.InspectionUpdateEvent(Trigger.new, Trigger.oldMap);
    }
}