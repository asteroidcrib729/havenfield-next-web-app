export interface MediaItem {id:string;url:string;objectKey:string;storage:"local"|"blob";width:number;height:number;bytes:number;alt:string;owner:string;createdAt:string;state:"uploading"|"active"|"deleting"|"deleted";references:number;cleanupEligible:boolean;}
export interface MediaList {items:MediaItem[];total:number;page:number;limit:number;}
