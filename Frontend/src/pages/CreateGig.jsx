import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiImage, FiPlus, FiX, FiInfo, FiTag, FiDollarSign, FiClock, FiRefreshCw } from 'react-icons/fi';
import { gigsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import './CreateGig.css';

const CATEGORIES = [
    { value: 'programming', label: 'Programming & Tech' },
    { value: 'design', label: 'Graphics & Design' },
    { value: 'writing', label: 'Writing & Translation' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
];

const CreateGig = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        deliveryDays: '',
        revisions: '1',
        tags: '',
        images: [],
    });

    const [imageInput, setImageInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddImage = () => {
        if (!imageInput) return;
        if (!imageInput.match(/^https?:\/\/.+/)) {
            toast.error('Please enter a valid image URL');
            return;
        }
        if (formData.images.length >= 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageInput]
        }));
        setImageInput('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        if (formData.images.length >= 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, reader.result]
            }));
        };
        reader.readAsDataURL(file);

        // Reset file input
        e.target.value = '';
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.deliveryDays) {
            toast.error('Please fill all required fields');
            return;
        }

        if (formData.images.length === 0) {
            toast.error('Please add at least one image URL');
            return;
        }

        setLoading(true);
        try {
            const gigData = {
                ...formData,
                price: Number(formData.price),
                deliveryDays: Number(formData.deliveryDays),
                revisions: Number(formData.revisions),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            };

            await gigsAPI.create(gigData);
            toast.success('Gig created successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create gig:', error);
            toast.error(error.response?.data?.message || 'Failed to create gig');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-gig-page">
            <div className="container narrow">
                <div className="page-header">
                    <h1>Create a <span className="text-gradient">New Gig</span></h1>
                    <p>Share your skills with the world and start earning</p>
                </div>

                <form onSubmit={handleSubmit} className="create-gig-form">
                    {/* Basic Info */}
                    <Card padding="lg" className="form-section">
                        <h2 className="section-title"><FiInfo /> Basic Information</h2>

                        <Input
                            label="Gig Title"
                            name="title"
                            placeholder="I will do something I'm really good at"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={120}
                        />

                        <div className="form-row">
                            <Select
                                label="Category"
                                name="category"
                                options={CATEGORIES}
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Tags (comma separated)"
                                name="tags"
                                placeholder="web, react, node"
                                value={formData.tags}
                                onChange={handleChange}
                                icon={<FiTag />}
                            />
                        </div>

                        <div className="input-wrapper">
                            <label className="input-label">Description</label>
                            <textarea
                                className="input-field textarea"
                                name="description"
                                placeholder="Describe your service in detail..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                maxLength={5000}
                            />
                        </div>
                    </Card>

                    {/* Pricing & Delivery */}
                    <Card padding="lg" className="form-section">
                        <h2 className="section-title"><FiDollarSign /> Pricing & Delivery</h2>

                        <div className="form-grid-3">
                            <Input
                                label="Price (₹)"
                                name="price"
                                type="number"
                                placeholder="500"
                                value={formData.price}
                                onChange={handleChange}
                                icon={<FiDollarSign />}
                                required
                                min={100}
                            />
                            <Input
                                label="Delivery (Days)"
                                name="deliveryDays"
                                type="number"
                                placeholder="3"
                                value={formData.deliveryDays}
                                onChange={handleChange}
                                icon={<FiClock />}
                                required
                                min={1}
                                max={30}
                            />
                            <Input
                                label="Revisions"
                                name="revisions"
                                type="number"
                                placeholder="1"
                                value={formData.revisions}
                                onChange={handleChange}
                                icon={<FiRefreshCw />}
                                required
                                min={0}
                                max={10}
                            />
                        </div>
                    </Card>

                    {/* Images */}
                    <Card padding="lg" className="form-section">
                        <h2 className="section-title"><FiImage /> Gig Images</h2>
                        <p className="section-subtitle">Add images from your device or use image URLs</p>

                        <div className="upload-options">
                            <div className="file-upload-box">
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" className="file-upload-label">
                                    <FiPlus size={24} />
                                    <span>Upload from Device</span>
                                </label>
                            </div>

                            <div className="url-upload-box">
                                <div className="image-input-group">
                                    <Input
                                        placeholder="Or paste image URL (https://...)"
                                        value={imageInput}
                                        onChange={(e) => setImageInput(e.target.value)}
                                        icon={<FiImage />}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleAddImage}
                                        icon={<FiPlus />}
                                        size="md"
                                    >
                                        Add URL
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="image-preview-grid">
                            {formData.images.map((img, index) => (
                                <div key={index} className="image-preview-card">
                                    <img src={img} alt={`Preview ${index}`} />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => removeImage(index)}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                            {formData.images.length === 0 && (
                                <div className="image-placeholder">
                                    <FiImage size={32} />
                                    <span>No images added</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            size="lg"
                        >
                            Create Gig
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
