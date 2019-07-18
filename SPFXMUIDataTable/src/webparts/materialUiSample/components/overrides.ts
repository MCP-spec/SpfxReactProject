import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides'

declare module '@material-ui/core/styles/overrides' {
    interface ComponentNameToClassKey {
      MuiDataTable?: {
        head: {
          height?: string
          maxHeight?: string
        }
      },
      MUIDataTableHeadCell: {
        fixedHeader: {
          backgroundColor?:string,
          color?:string,
          top?:string
        },
        MuiTableSortLabel:{
            active:{
              color:string
            }
          }
      },
     
    }
  }