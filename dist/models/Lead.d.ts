import mongoose, { Document } from 'mongoose';
export interface ILead extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone: string;
    source: string;
    data: Record<string, any>;
    status: 'new' | 'contacted' | 'converted' | 'lost';
    aiScore?: number;
    aiSummary?: string;
}
declare const _default: mongoose.Model<ILead, {}, {}, {}, mongoose.Document<unknown, {}, ILead, {}, mongoose.DefaultSchemaOptions> & ILead & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILead>;
export default _default;
//# sourceMappingURL=Lead.d.ts.map