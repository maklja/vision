invokeTrigger - should be removed and replaced with maybe some type of observable factory
For example the operator catchError
const [refObservable] = options.referenceObservables;
return catchError<FlowValue, ObservableInput<FlowValue>>((error) => {
    return refObservable.createObservable(error);
});
