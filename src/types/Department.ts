export type Department = {
    id: string;
    name: string;
    code: string;
    superiorId:string;
    superiorName:string;
    organizationId: string;
    organizationName: string;
    created: string;
    lastEdited: string;
    archived: boolean;
    parentDepartmentId: string | null;
    parentDepartmentName: string | null;
    childDepartments: string[]; 
}
