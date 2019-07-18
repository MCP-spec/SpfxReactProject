import BusinessCentersItem from "./BusinessCentersItem";

export default interface IMaterialUiSampleState {
    
    Centers: BusinessCentersItem[];
    page: number;
    rowsPerPage: number;
    showDetailsDialog:boolean;
    Center:BusinessCentersItem;
    searchValue:string;
   
}