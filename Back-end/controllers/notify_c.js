import Notify from "../models/notify_m.js";

const notifyCtrl = {
    createNotify: async (req, res) => {
        console.log('Create Notify');
        const { id, recipients, url, text, content, image } = req.body;

        // console.log(req.body, '*-*-');

        // console.log(req.user._id, '+//');
        if (recipients.includes(req.user._id.toString())) {
            return;
        };

        const notify = await Notify.create({
            id, recipients, url, text, content, image, user: req.user._id
        });

        res.status(200).json({ notify });
    },

    removeNotify: async (req, res) => {
        console.log('remove Notify');
        // console.log(req.params.id);
        // console.log(req.query.url);
        const notify = await Notify.findOneAndDelete({
            id: req.params.id,
            url: req.query.url,
        })

        res.status(200).json({ notify });
    },

    getNotifies: async (req, res) => {
        console.log('get Notify');


        const notifies = await Notify.find({ recipients: req.user._id }).sort('-createdAt').populate('user', 'avatar username')

        res.status(200).json({ notifies });
    },

    isReadNotify: async (req, res) => {
        console.log('is read Notify');

        const notifies = await Notify.findOneAndUpdate(
            { _id: req.params.id },
            {
                isRead: true
            });
        res.status(200).json({ notifies });
    },

    deleteAllNotifies: async (req, res) => {
        console.log('delete Notify');
        // console.log(req.user._id);
        // console.log(req.user.recipients, '**');
        const notifies = await Notify.deleteMany({ recipients: req.user._id })
        // console.log(req.user.recipients, '---');
        // console.log(notifies);
        res.status(200).json({ notifies });
    }
}

export default notifyCtrl;