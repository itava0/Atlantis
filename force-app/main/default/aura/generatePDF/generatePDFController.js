({
    doInit: function(component) {
        setTimeout(function () {component.find('lWCComponent2').LWCFunction()}, 1500);
        setTimeout(function () {$A.get('e.force:closeQuickAction').fire();}, 3500);
    }
})