import { useEffect, useState, useCallback } from "react";
import purchaseOrderApi from "../../api/purchaseOrderApi";

export default function PurchaseOrderAttachments({ poId }) {

    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const load = useCallback(async () => {

        try {

            const data =
                await purchaseOrderApi.getAttachments(poId);

            setAttachments(data);

        } catch (err) {

            console.error(err);

        }

    }, [poId]);

    useEffect(() => {

        load();

    }, [load]);

    const upload = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        try {

            setUploading(true);

            await purchaseOrderApi.uploadAttachment(
                poId,
                file
            );

            await load();

        } finally {

            setUploading(false);

        }

    };

    return (

        <div className="bg-white rounded-xl shadow border p-6 mt-6">

            <div className="flex justify-between items-center mb-4">

                <h3 className="font-semibold text-lg">
                    Attachments
                </h3>

                <label className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer">

                    Upload

                    <input
                        hidden
                        type="file"
                        onChange={upload}
                    />

                </label>

            </div>

            {uploading && (

                <p className="text-sm text-gray-500">

                    Uploading...

                </p>

            )}

            {attachments.length === 0 && (

                <p className="text-gray-500">

                    No attachments

                </p>

            )}

            {attachments.map(file => (

                <div
                    key={file.id}
                    className="flex justify-between items-center border rounded p-3 mb-2"
                >

                    <div>

                        📄 {file.file_name}

                    </div>

                    <div className="flex gap-2">

                        <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/purchase-orders/attachments/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600"
                        >
                            Download
                        </a>

                        <button
                            className="text-red-600"
                            onClick={async () => {

                                if (
                                    !window.confirm(
                                        "Delete attachment?"
                                    )
                                )
                                    return;

                                await purchaseOrderApi.deleteAttachment(
                                    file.id
                                );

                                load();

                            }}
                        >
                            Delete
                        </button>

                    </div>

                </div>

            ))}

        </div>

    );

}