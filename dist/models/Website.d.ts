import mongoose, { Document } from 'mongoose';
export interface IWebsite extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    url: string;
    apiKey: string;
    isActive: boolean;
}
declare const _default: mongoose.Model<IWebsite, {}, {}, {}, mongoose.Document<unknown, {}, IWebsite, {}, mongoose.DefaultSchemaOptions> & IWebsite & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWebsite>;
export default _default;
//# sourceMappingURL=Website.d.ts.map