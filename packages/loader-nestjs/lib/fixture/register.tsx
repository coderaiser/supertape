export function Form(props) {
    const CustomForm = getForm(props.type);
    
    return (
        <CustomForm {...props}/>
    );
}

class X {
   constructor(
        @Inject('SNIPPETS') private readonly snippets: Map<string, any>,
   ) {
   }
};

