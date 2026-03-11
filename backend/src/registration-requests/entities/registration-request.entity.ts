export class RegistrationRequest {
    id: string;
    walletAddress: string;
    type: 'school' | 'student';
    status: 'pending' | 'approved' | 'rejected';


    schoolName?: string;
    schoolDocument?: string;
    studentCode?: string;
    schoolId?: string;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}