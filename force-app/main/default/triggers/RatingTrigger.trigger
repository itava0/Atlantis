trigger RatingTrigger on Rating__c (after insert, after update, before delete) {
    
    // Insert or Update a Rating
    if (Trigger.isInsert || Trigger.isUpdate) {
        RatingUpdateInsert.RatingUpdatedInserted(Trigger.new);
    }
    // Delete a Rating
    if (Trigger.isDelete) {
        RatingDelete.RatingDeleted(Trigger.old);
	}

}