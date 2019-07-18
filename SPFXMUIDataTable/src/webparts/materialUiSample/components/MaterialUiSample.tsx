import * as React from 'react';
import styles from './MaterialUiSample.module.scss';
import { IMaterialUiSampleProps } from './IMaterialUiSampleProps';
import Table from '@material-ui/core/Table';
import IMaterialUiSampleState from './IMaterialUiSampleState';
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import {SPHttpClient,SPHttpClientResponse,
  ISPHttpClientOptions } from  '@microsoft/sp-http';  
import DetailsDialog from './DetailsDialog/DetailsDialog';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import MUIDataTable from 'mui-datatables'
require("@pnp/logging");
require("@pnp/common");
require("@pnp/odata");
import * as Moment from 'moment';
import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides'
import  Link  from "@material-ui/core/Link";
import {
  createMuiTheme,
  MuiThemeProvider
 } from "@material-ui/core/styles";
import { sp, DateTimeFieldFormatType, SortDirection } from "@pnp/sp";
import BusinessCentersItem from './BusinessCentersItem';
import { WebPartTitle } from '@pnp/spfx-controls-react';
import { Tooltip } from 'chart.js';
/**
  *Increase search time via  Configure RXJS debounceTime 
*/
const onSearch$ = new Subject();
const searchPipe = onSearch$.pipe(
  debounceTime(1000)
);
//Extend "MUIdatatables properties" via  Theme from overriding  MUIDatatable "Overrides" class
//Please follow Overrides.ts class to extend "MUIDatatable" properties.
const getMuiTheme = () => createMuiTheme({
  overrides: {
    MuiDataTable: {
      head: {
          height: "100px",
          maxHeight: "100px",
        }
        },
      
    MUIDataTableHeadCell: {
      fixedHeader: {
        backgroundColor:"#0092d6",
        color:"#f3f2f1",
        top:"0px"
      }
    },
  MuiTableSortLabel:{
    active:{
      color:"#f3f2f1"
    }
  }
}
       
});
let subscription: any;

export default class MaterialUiSample extends React.Component<IMaterialUiSampleProps, IMaterialUiSampleState> {
 
   constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      Centers: [],
      page: 0,
      rowsPerPage: 20,
      showDetailsDialog: false,
      Center: {
        Title: '',
        Category: '',
        View: 'test',
        Path: 'test',
        Modified:'',
        DocType:''
         }
    };       

    
    this.getItems().then(Centers => {
      this.setState({
        Centers
      });
    });
    this.onInputChange = this.onInputChange.bind(this);
  }
  /**
  * Subscribe to the search input to get the results
  * Create Handle Click Provate function to define "Edit" button ICON"
*/
private  handleClick(value) {
  var url=value;
  window.open(url);
   console.log({ value });
}
  public componentDidMount() {
    console.log("didmount")
    //Subscribe filteritmes and use get and filter functionality if using "Msterial UI" not "MUIDatatables."
     subscription = searchPipe.subscribe(
      searchInput => this.filterItems(searchInput).then(Centers => {
        this.setState({
          Centers
        });
      })
    );
  }
  /**
  * Unsubscribe from the subject when we are done with the component
  */
  public componentWillUnmount() {
    if (subscription) {
      subscription.unsubscribe();
    }
  }
  
  public render(): React.ReactElement<IMaterialUiSampleProps> {
 
    const { Centers} = this.state;
   // const emptyRows = rowsPerPage - Math.min(rowsPerPage, Centers.length - page * rowsPerPage);      
   //Define your own columns and their functionality for adding "Edit icon" .
   //You can expand  more to create more  "Themes" and diffent view of datatable.
      const columns = [
        {
          name: "View",
          options: {
            filter: false,
            sort:false,
           customBodyRender: (value, tableMeta, updateValue) => {
              return (
              
                <IconButton onClick={() => this.handleClick(value)}>
                 <EditIcon />
                  </IconButton>
                
               
              );
            }
          }
        },
        {
          name: "Title",
          options: {
            filter: true
          }
        },
        {
          name: "Category",
          options: {
            filter: true
          }
        },
        {
          name: "Modified",
          options: {
            filter: true,
          
          }
        },
        {
          name: "Path",
          options: {
            filter: true,
            sort: true
          }
        }
      ];
  
    const options = {
         filter:true,
         filterType: "dropdown",
         responsive: "scroll",
          selectableRows: "none",
         isRowSelectable:false,
           customRender: (index, value, updateValue) => {
          debugger;
          return (
            <a href="https://YourDomain.sharepoint.com/sites/sitename/" title="User details">
              {value}
            </a>
          );
        }
          };
        
    return(
      <div>

      <MuiThemeProvider theme={getMuiTheme}>
      
<MUIDataTable
  title={"Business Center Forms and Documents"}
  data={Centers}
  columns={columns}
  options={options}
/>
</MuiThemeProvider>
</div>);     
}
/*** Update the state and the subject */
  private onInputChange(value: string) {
    this.setState({
      searchValue: value,
    });
    onSearch$.next(value);
  } /*** Gets the items from the list */
  private getItems(): Promise<BusinessCentersItem[]> {    
   console.log("enter Get"); //;    
    //spath.toString().split("\")[Splitarry.length-2];
    console.log(this.props.webUrl);
    console.log(this.props.spHttpClient);
    //GET sphttprequest  weburl plus query string plus filters 
    /*Here I am collecting all documents uploaded in all document libraries based on "Owning Dept" content type  from Webpart properties 
     *By using  "Rest search Query" with content type filters and specific properties.
     Please change your domain specified URL here
    */
    return this.props.spHttpClient.get(this.props.webUrl + "/_api/search/query?querytext=' '&selectproperties='Path,OwningDepartmentOWSCHCS,modifiedby,Title,DocTypeOWSTEXT,ModifiedOWSDate,Author'&refinementfilters='OwningDepartmentOWSCHCS:equals(" +this.props.FormType + ")'&orderby='Title desc'&rowlimit=1000",SPHttpClient.configurations.v1,{
      headers: {  
      'Accept': 'application/json; odata=nometadata'  ,
      'odata-version': '',  
    } } )
    .then((res: SPHttpClientResponse)=> {
      console.log(res.url);
      console.log(res.json);
     return  res.json().then((data)=>{
        let people: BusinessCentersItem[] = data.PrimaryQueryResult.RelevantResults.Table.Rows.map(r => {
        let spath=this._getValueFromSearchResult('Path', r.Cells);
        let modifieddate=Moment(this._getValueFromSearchResult('ModifiedOWSDate', r.Cells)).format('MM-DD-YYYY hh:mm a');
        debugger;
     let rowcount=data.PrimaryQueryResult.RelevantResults.Properties.RowCount ;
     console.log("ROWCOUNT" + rowcount);
     /*
     Extract Document Library "Name" coming from path using "Split" function of array
     */
      let  Splitarryath=spath.split("/");
      //Get path of Document library from querystring
        let URLpath=Splitarryath[Splitarryath.length-2];
           return {
           View:  this._getValueFromSearchResult('Path', r.Cells),
          Title: this._getValueFromSearchResult('Title', r.Cells),
          Category: this._getValueFromSearchResult('OwningDepartmentOWSCHCS', r.Cells),
          Path:URLpath,
          Modified:modifieddate,
          DocType:this._getValueFromSearchResult('DocTypeOWSTEXT', r.Cells)

        };
               
                     });
          return people;   
         });
     
    });
    
  
   }
  /**
  * Get the items from the list based on the search input
  * All data comes in XML format filter records based on PrimaryQueryResult.RelevantResults.Properties Tables/Rows
*/
private _getValueFromSearchResult(key: string,ArrayCells): string {
  for (let i: number = 0; i < ArrayCells.length; i++) {
    if (ArrayCells[i].Key === key) {
         return ArrayCells[i].Value;
    }
  }}
  /*
  USe below filteritems functions if using "React Material UI libraries" for future references but form "MUI data tables its not requires as it comes with all
  Sorting ,Filterations options.
  */
  private filterItems(keyword): Promise<BusinessCentersItem[]> {
          const query: string = keyword === null ? 'contenttype:MXFormsContentType':'Title:*${keyword}*';
    if (!keyword)
     return this.getItems();
        

    // here we are using the getAs operator so that our returned value will be typed
    let url=this.props.webUrl;
    console.log("URL" + url);
    url+="/_api/search/query?querytext='"+ keyword + "*" + "'" ;
    url+="&selectproperties='Path,OwningDepartmentOWSCHCS,Title,Author,DocTypeOWSTEXT,ModifiedOWSDate'&sortlist='rank:descending,ModifiedBy:descending'&refinementfilters='OwningDepartmentOWSCHCS:equals("+ this.props.FormType + ")'&rowlimit='1000'";
          return this.props.spHttpClient.get(url,SPHttpClient.configurations.v1,{
         headers: {  
         'Accept': 'application/json; odata=nometadata',
         'odata-version': '',  
       }})
    .then((res: SPHttpClientResponse)=> {
     console.log(res.url);
     console.log(res.status);
          return  res.json().then((data)=>{
         let people: BusinessCentersItem[] = data.PrimaryQueryResult.RelevantResults.Table.Rows.map(r => {
         let spath=this._getValueFromSearchResult('Path', r.Cells);
         let modifieddate=Moment(this._getValueFromSearchResult('ModifiedOWSDate', r.Cells)).format('MM-DD-YYYY hh:mm a');
     //USe Array Splitarray function to get and display Path of Document Library It brings in
      let  Splitarryath=spath.split("/");
        let URLpath=Splitarryath[Splitarryath.length-2];
        return {
            View:  this._getValueFromSearchResult('Path', r.Cells),
          Title: this._getValueFromSearchResult('Title', r.Cells),
          Category: this._getValueFromSearchResult('OwningDepartmentOWSCHCS', r.Cells),
          Path:URLpath,
          Modified:modifieddate,
          DocType:this._getValueFromSearchResult('DocTypeOWSTEXT', r.Cells)
                  };       
            //      alert(r.Cells)       ;
           });  
          return people;   
         });
        });
   /*return sp.web.lists.getByTitle("Centers").items
      .select("Name", "Title", "Category")
      .filter(`substringof('${keyword}',Title)`)
      .get<BusinessCentersItem[]>();*/ }

  /**
  * Handle the Row events functionality sample for future references
  * Handle Row click,Row select,Page events if want to utilize
*/
onRowClick = (rowData: string[], rowMeta: { dataIndex: number, rowIndex: number }) => {
	console.log("----RowClick");
	console.log("rowData: ", rowData[4]);
	console.log("rowMeta: ", rowMeta.dataIndex);
}

onRowsSelect = (curRowSelected, allRowsSelected) => {
	console.log("---RowSelect")
	console.log("Row Selected: ", curRowSelected);
	console.log("All Selected: ", allRowsSelected);
}
  private handleChangePage = (event, page) => {
    this.setState({ page });
  }

  /**
  * Handle the change rows per page
*/
  private handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  }

  /**
  * Handle the details dialog state
*/
  private handleClickOpen = (Center: BusinessCentersItem) => {
    this.setState({
      showDetailsDialog: true,
      Center
    });
  }
  /**
  * Close the details dialog 
*/
  private handleClose = () => {
    this.setState({ showDetailsDialog: false });
  }

}
