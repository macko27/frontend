import OrgNode from "./OrgNode"

type OrgTree = {
    id: string,
    name: string,
    code: string,
    orgTree: OrgNode[]
}

export default OrgTree