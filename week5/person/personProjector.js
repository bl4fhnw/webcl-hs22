import {VALUE, VALID, EDITABLE, LABEL} from "../presentationModel/presentationModel.js";

export { personListItemProjector, personTableProjector, personFormProjector }

const bindTextInput = (textAttr, inputElement) => {
    inputElement.oninput = _ => textAttr.setConvertedValue(inputElement.value);

    textAttr.getObs(VALUE).onChange(text => inputElement.value = text);

    textAttr.getObs(VALID, true).onChange(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    textAttr.getObs(EDITABLE, true).onChange(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    textAttr.getObs(LABEL, '').onChange(label => inputElement.setAttribute("title", label));
};

const personTextProjector = textAttr => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 20;

    bindTextInput(textAttr, inputElement);

    return inputElement;
};

const personListItemProjector = (masterController, selectionController, rootElement, person) => {

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement  = personTextProjector(person.lastname);

    firstnameInputElement.onfocus = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus  = _ => selectionController.setSelectedPerson(person);

    selectionController.onPersonSelected(
        selected => selected === person
          ? deleteButton.classList.add("selected")
          : deleteButton.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(firstnameInputElement);
        rootElement.removeChild(lastnameInputElement);
        selectionController.clearSelection();
        removeMe();
    } );

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(firstnameInputElement);
    rootElement.appendChild(lastnameInputElement);
    selectionController.setSelectedPerson(person);
};

const personFormProjector = (detailController, rootElement, person) => {

    const divElement = document.createElement("DIV");
    divElement.innerHTML = `
    <FORM>
        <DIV class="detail-form">
            <LABEL for="firstname"></LABEL>
            <INPUT TYPE="text" size="20" id="firstname">   
            <LABEL for="lastname"></LABEL>
            <INPUT TYPE="text" size="20" id="lastname">   
        </DIV>
    </FORM>`;

    bindTextInput(person.firstname, divElement.querySelector('#firstname'));
    bindTextInput(person.lastname,  divElement.querySelector('#lastname'));

    // beware of memory leak in person.firstname observables
    person.firstname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=firstname]').textContent = label);
    person.lastname.getObs(LABEL, '')
        .onChange(label => divElement.querySelector('[for=lastname]').textContent = label);

    rootElement.firstChild.replaceWith(divElement);
};


const personTableProjector = (masterController, selectionController, rootElement, person) => {
    //let table           = document.getElementById("table");
    let table           = rootElement.getElementsByTagName("table")[0];
    let tHead, tBody;

    if(!table){
        table   = document.createElement("table");
        tHead   = document.createElement("thead");
        tBody   = document.createElement("tbody");

        tHead.innerHTML = "<tr><th>Delete</th><th>First Name</th><th>Last Name</th></tr>"

        //table.setAttribute("id","table")
        table.appendChild(tHead);
        table.appendChild(tBody);
        rootElement.appendChild(table);
    }else{
        tBody = table.getElementsByTagName('tbody')[0];
    }

    const deleteButton      = document.createElement("Button");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => masterController.removePerson(person);
    deleteButton.setAttribute("class","delete");

    const firstnameInputElement = personTextProjector(person.firstname);
    const lastnameInputElement  = personTextProjector(person.lastname);

    firstnameInputElement.onfocus   = _ => selectionController.setSelectedPerson(person);
    lastnameInputElement.onfocus    = _ => selectionController.setSelectedPerson(person);

    const personRow         = document.createElement("tr");
    const deleteField       = document.createElement("td");
    const firstNameField    = document.createElement("td");
    const lastNameField     = document.createElement("td");

    deleteField.appendChild(deleteButton);
    firstNameField.appendChild(firstnameInputElement);
    lastNameField.appendChild(lastnameInputElement);

    personRow.appendChild(deleteField);
    personRow.appendChild(firstNameField);
    personRow.appendChild(lastNameField);

    tBody.appendChild(personRow)

    selectionController.onPersonSelected(
        selected => selected === person
            ? personRow.classList.add("selected")
            : personRow.classList.remove("selected")
    );

    masterController.onPersonRemove( (removedPerson, removeMe) => {
        if (removedPerson !== person) return;
        selectionController.clearSelection();
        removeMe();
        tBody.removeChild(personRow);

        if(tBody.children.length < 1)
            rootElement.removeChild(table);
    } );

    selectionController.setSelectedPerson(person);
};
