type OrgNode  = {
    emplyeeCardId: string,
    userId: string,
    level: number,
    name: string,
    position: string,
    location: string,
    image: string,
    isSuperior: boolean,
    children: OrgNode[],
    expanded: true,
    className: string,
}


export default OrgNode;
