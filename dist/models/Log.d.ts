import mongoose, { Document } from 'mongoose';
export interface ILog extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'lead_capture' | 'email_sent' | 'call_triggered' | 'system_error' | 'payment';
    status: 'success' | 'failed' | 'pending';
    message: string;
    metadata: any;
}
declare const _default: mongoose.Model<ILog, {}, {}, {}, mongoose.Document<unknown, {}, ILog, {}, mongoose.DefaultSchemaOptions> & ILog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILog>;
export default _default;
//# sourceMappingURL=Log.d.ts.map