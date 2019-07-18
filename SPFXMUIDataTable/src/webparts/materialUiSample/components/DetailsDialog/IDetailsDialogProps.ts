import BookListItem from "../BusinessCentersItem";

export default interface IDetailsDialogProps{
    open:boolean;
    handleClose:()=>void;
    book:BookListItem;
}