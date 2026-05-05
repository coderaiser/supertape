export function Form(props) {
    const CustomForm = getForm(props.type);
    
    return (
        <CustomForm {...props}/>
    );
}
