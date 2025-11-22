import { Dayjs } from "dayjs";
import { EmployeeCard } from "../EmployeeCard";

export type CourseResponse = {
    Name: string
    DetailDescription: string
    CreatedUserId: string
    Employees: string[]
    Type: string
    Files: FileRequest[]
    Version: number
    ExpirationDate: string
};
export type FileRequest = {
    Description: string
    FilePath: string
};