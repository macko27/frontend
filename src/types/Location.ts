export type Location = {
    id: string;
    name: string; 
    code: string; 
    city: string;
    zipcode: string;
    organizations: string[]; 
    latitude: string;
    longitude: string;
    lastEdited: Date;
    created: Date; 
    archived: boolean; 
}